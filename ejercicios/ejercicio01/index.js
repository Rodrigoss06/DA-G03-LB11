import express from 'express';
import bodyParser from 'body-parser';
import { Pool } from 'pg';

const app = express();
const port = 3000;

// Configuración de conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres',       // Cambia esto si es necesario
  host: 'localhost',
  database: 'EJ01',  // Cambia esto a tu base de datos
  password: 'root',   // Cambia esto a tu contraseña
  port: 5432,
});

// Middlewares
app.use(bodyParser.json());

// CRUD para clientes

// Endpoint GET: Obtiene todos los clientes
app.get('/clientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, correo, telefono FROM clientes'); // Ocultando contraseña
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los clientes' });
  }
});

// Endpoint POST: Agrega un nuevo cliente
app.post('/clientes', async (req, res) => {
  const { nombre, correo, telefono, contraseña } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO clientes (nombre, correo, telefono, contraseña) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, correo, telefono, contraseña]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el cliente' });
  }
});

// Endpoint PUT: Actualiza un cliente por ID
app.put('/clientes/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, telefono, contraseña } = req.body;
  try {
    const result = await pool.query(
      'UPDATE clientes SET nombre = $1, correo = $2, telefono = $3, contraseña = $4 WHERE id = $5 RETURNING *',
      [nombre, correo, telefono, contraseña, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el cliente' });
  }
});

// Endpoint DELETE: Elimina un cliente por ID
app.delete('/clientes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(200).json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
});

// CRUD para productos

// Endpoint GET: Obtiene todos los productos
app.get('/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

// Endpoint POST: Agrega un nuevo producto
app.post('/productos', async (req, res) => {
  const { nombre, descripcion, precio, stock } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, descripcion, precio, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el producto' });
  }
});

// Endpoint PUT: Actualiza un producto por ID
app.put('/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock } = req.body;
  try {
    const result = await pool.query(
      'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, stock = $4 WHERE id = $5 RETURNING *',
      [nombre, descripcion, precio, stock, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

// Endpoint DELETE: Elimina un producto por ID
app.delete('/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor en funcionamiento en http://localhost:${port}`);
});
