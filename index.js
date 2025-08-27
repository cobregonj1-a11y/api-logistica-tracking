const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

// Conexión a la base de datos usando DATABASE_URL de Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // necesario para Render
});

// GET: obtener todas las coordenadas
app.get("/coordenadas", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM coordenadas ORDER BY fecha DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener coordenadas:", err);
    res.status(500).json({ error: "Error al obtener coordenadas" });
  }
});

// POST: guardar una nueva coordenada
app.post("/coordenadas", async (req, res) => {
  const { latitud, longitud } = req.body;

  if (!latitud || !longitud) {
    return res.status(400).json({ error: "latitud y longitud son requeridos" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO coordenadas(latitud, longitud) VALUES ($1, $2) RETURNING *",
      [latitud, longitud]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al guardar coordenada:", err);
    res.status(500).json({ error: "Error al guardar coordenada" });
  }
});

// Puerto asignado por Render o 3000 local
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
