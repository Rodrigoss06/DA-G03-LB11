import express from "express";
import pg from "pg";
import bodyParser from 'body-parser';
import morgan from "morgan";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const app = express();
const SECRET_KEY = "mi_secreto";  // Llave secreta para el JWT (mejor almacenarla en variables de entorno)

// Configuración de la conexión con PostgreSQL
const pool = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "EJ02",
    password: "root",
    port: "5432"
});

// Middlewares
app.use(bodyParser.json());
app.use(morgan("dev"));

// Registro de nuevo usuario
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    if (username && email && password) {
        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const newUser = await pool.query(
                "INSERT INTO usuarios (username, email, password) VALUES ($1, $2, $3) RETURNING *",
                [username, email, hashedPassword]
            );
            res.status(201).json(newUser.rows[0]);
        } catch (error) {
            res.status(500).json({ message: "Error al registrar el usuario", error });
        }
    } else {
        res.status(400).json({ message: "Campos incompletos" });
    }
});

// Inicio de sesión y generación de token
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        try {
            const userResult = await pool.query(
                "SELECT * FROM usuarios WHERE username = $1",
                [username]
            );
            const user = userResult.rows[0];

            if (user && await bcrypt.compare(password, user.password)) {
                // Generar token JWT
                const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "600m" });
                res.status(200).json({ token });
            } else {
                res.status(401).json({ message: "Credenciales incorrectas" });
            }
        } catch (error) {
            res.status(500).json({ message: "Error en el inicio de sesión", error });
        }
    } else {
        res.status(400).json({ message: "Campos incompletos" });
    }
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "Token requerido" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Token inválido" });
        req.user = user;
        next();
    });
};

// Obtener todos los usuarios (protegido)
app.get("/users", authenticateToken, async (req, res) => {
    try {
        const users = await pool.query("SELECT id, username, email FROM usuarios");
        res.status(200).json(users.rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los usuarios", error });
    }
});

// Obtener un usuario por ID (protegido)
app.get("/user/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const userResult = await pool.query("SELECT id, username, email FROM usuarios WHERE id = $1", [id]);
        const user = userResult.rows[0];
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: "Usuario no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el usuario", error });
    }
});

// Eliminar un usuario por ID (protegido)
app.delete("/user/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM usuarios WHERE id = $1 RETURNING *", [id]);
        if (result.rowCount > 0) {
            res.status(200).json({ message: "Usuario eliminado correctamente" });
        } else {
            res.status(404).json({ message: "Usuario no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el usuario", error });
    }
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log("Servidor en funcionamiento en el puerto 3000");
});
