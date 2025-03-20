const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { z } = require('zod');

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Load country settings from JSON file
const countrySettingsPath = path.join(__dirname, 'countrySettings.json');
let countrySettings = {};

const loadCountrySettings = () => {
  try {
    const data = fs.readFileSync(countrySettingsPath, 'utf-8');
    countrySettings = JSON.parse(data);
  } catch (error) {
    console.error('Error loading country settings:', error);
  }
};

// Load settings at startup
loadCountrySettings();

// API: Get form fields for a specific country
app.get('/api/form/:country', (req, res) => {
  const { country } = req.params;
  const fields = countrySettings[country];

  if (!fields) {
    return res.status(404).json({ error: 'Country settings not found' });
  }

  res.json(fields);
});

// Function to generate Zod schema dynamically
const generateZodSchema = (fields) => {
  const schemaShape = {};

  fields.forEach(field => {
    let fieldSchema;

    switch (field.type) {
      case 'string':
        fieldSchema = z.string().min(1, `${field.label} cannot be empty`);
        break;
      case 'number':
        fieldSchema = z.preprocess((val) => Number(val), z.number().positive("Must be a positive number"));
        break;
      case 'date':
        fieldSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)");
        break;
      case 'email':
        fieldSchema = z.string().email("Invalid email format");
        break;
      case 'phone':
        const minLength = field.phone_length ? field.phone_length[0] : 10;
        const maxLength = field.phone_length ? field.phone_length[1] : 15;
        fieldSchema = z.string()
          .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
          .min(minLength, `Phone number must be at least ${minLength} digits`)
          .max(maxLength, `Phone number must not exceed ${maxLength} digits`);
        break;
      default:
        fieldSchema = z.any();
    }

    if (field.required) {
      schemaShape[field.name] = fieldSchema;
    } else {
      schemaShape[field.name] = fieldSchema.optional();
    }
  });

  return z.object(schemaShape);
};


// API: Submit form data with validation
app.post('/api/submit-form', (req, res) => {
  const { country, formData } = req.body;

  if (!country || !formData) {
    return res.status(400).json({ error: 'Country and formData are required' });
  }

  const fields = countrySettings[country];

  if (!fields) {
    return res.status(400).json({ error: 'Invalid country' });
  }

  const schema = generateZodSchema(fields);
  
  console.log('Validating submission:', JSON.stringify(formData, null, 2));

  const validation = schema.safeParse(formData);

  console.log('🔍 Validation result:', JSON.stringify(validation, null, 2));

  if (!validation.success) {
    console.error('Validation failed:', validation.error.format());
    return res.status(400).json({ error: 'Validation failed', details: validation.error.format() });
  }

  console.log('Form submission valid:', formData);

  res.json({ message: 'Form submitted successfully' });
});



app.get('/api/countries', (req, res) => {
  const availableCountries = Object.keys(countrySettings);
  res.json(availableCountries);
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
