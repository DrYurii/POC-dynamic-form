const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Enable CORS (allows frontend to call API)
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

// API: Get form fields based on country
app.get('/api/form/:country', async (req, res) => {
  const { country } = req.params;
  console.log(`Fetching form fields for country: ${country}`);

  try {
    const query = `
      SELECT name, label, type, 
             CASE 
                 WHEN $1 = ANY(hidden_in) THEN 'hidden'
                 WHEN $1 = ANY(required_in) THEN 'required'
                 ELSE 'optional'
             END AS visibility
      FROM form_fields`;

    const { rows } = await pool.query(query, [country]);
    const filteredFields = rows.filter(field => field.visibility !== 'hidden');

    console.log(`Form fields retrieved:`, filteredFields);
    res.json(filteredFields);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Database query error', details: error.message });
  }
});

// API: Submit form data
app.post('/api/submit-form', async (req, res) => {
  const { country, formData } = req.body;

  if (!country) {
    return res.status(400).json({ error: 'Country is required' });
  }

  console.log(`Received form submission from ${country}:`, formData);

  try {
    // Fetch form validation rules from the database
    const query = `
      SELECT name, 
             CASE 
                 WHEN $1 = ANY(hidden_in) THEN 'hidden'
                 WHEN $1 = ANY(required_in) THEN 'required'
                 ELSE 'optional'
             END AS visibility
      FROM form_fields`;

    const { rows } = await pool.query(query, [country]);

    // Validate form data
    for (const field of rows) {
      if (field.visibility === 'hidden' && formData[field.name]) {
        return res.status(400).json({ error: `${field.name} is not allowed in ${country}` });
      }
      if (field.visibility === 'required' && !formData[field.name]) {
        return res.status(400).json({ error: `${field.name} is required in ${country}` });
      }
    }

    // Save form data
    await pool.query(
      `INSERT INTO user_submissions (country, data) VALUES ($1, $2)`,
      [country, JSON.stringify(formData)]
    );

    res.json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ error: 'Error saving form', details: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
