# Dynamic Form System

This project is a **dynamic form management system** that allows form fields to be customized based on the user's country. It ensures compliance with local regulations by hiding, requiring, or allowing certain fields dynamically.

## Features

- Dynamically renders form fields based on country-specific rules
- Supports required and hidden fields per country
- Stores form submissions with country of submission
- Provides a REST API for frontend-backend communication
- Uses PostgreSQL for database storage
- Implements validation before saving user input

---

## Installation

### Backend
```
cd backend
npm install
```

Create .env file in backend/
```
PORT=3000
DB_NAME=dynamicformdb
DB_USER=dynamicformuser
DB_HOST=localhost
DB_PASSWORD=yourpassword
DB_PORT=5432
```

### Start Backend
```
npm run dev
```

### Frontend Setup
```
cd ../frontend
npm install
npm run dev
```

### Database Setup

1. Create PostgreSQL Database
```
CREATE DATABASE dynamicformdb;
```

2. Create Tables
```
CREATE TABLE form_fields (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    label VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'number', 'date', 'email', 'checkbox')),
    required_in TEXT[],  -- Countries where this field is required
    hidden_in TEXT[]     -- Countries where this field is hidden
);

CREATE TABLE user_submissions (
    id SERIAL PRIMARY KEY,
    country VARCHAR(10) NOT NULL,  -- Stores the country from which the form was submitted
    data JSONB NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. Insert Test Data
```
INSERT INTO form_fields (name, label, type, required_in, hidden_in) VALUES
('national_id', 'National ID', 'text', ARRAY['US', 'MX', 'BR'], ARRAY['DE', 'FR']),
('passport', 'Passport Number', 'text', ARRAY['DE', 'FR', 'IT'], ARRAY['US', 'CA']),
('dob', 'Date of Birth', 'date', ARRAY['US', 'FR', 'DE', 'IT'], ARRAY[]::TEXT[]),
('phone', 'Phone Number', 'text', ARRAY['US', 'CA', 'AU'], ARRAY['BR']),
('tax_id', 'Tax Identification Number', 'text', ARRAY['US', 'CA', 'UK'], ARRAY['DE', 'IT']),
('ssn', 'Social Security Number', 'text', ARRAY['US'], ARRAY['FR', 'DE', 'CA']),
('residency', 'Residency Status', 'text', ARRAY['US', 'UK', 'AU'], ARRAY['MX', 'BR']),
('employment_status', 'Employment Status', 'text', ARRAY['CA', 'UK', 'AU'], ARRAY['US']),
('health_id', 'Health ID', 'text', ARRAY['FR', 'DE', 'IT'], ARRAY['US', 'MX']),
('driver_license', 'Driver’s License', 'text', ARRAY['US', 'CA', 'AU'], ARRAY['DE', 'IT']);
```

4. Grant Permissions
```
GRANT SELECT ON TABLE form_fields TO dynamicformuser;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_submissions TO dynamicformuser;
GRANT USAGE, SELECT ON SEQUENCE form_fields_id_seq TO dynamicformuser;
GRANT USAGE, SELECT ON SEQUENCE user_submissions_id_seq TO dynamicformuser;
```

## API Endpoints

🔹 Get Form Fields for a Country
```
GET /api/form/:country
```
Returns the form fields for the given country.

🔹 Submit Form Data
```
POST /api/submit-form
```
Request Body:
```
{
  "country": "US",
  "formData": {
    "national_id": "12345",
    "dob": "1990-01-01",
    "phone": "555-1234"
  }
}
```
Validates and stores the form data.

## Testing the Setup

Run a Test Query
```
curl -X GET http://localhost:3000/api/form/US
```
Submit Test Data
```
curl -X POST http://localhost:3000/api/submit-form \
     -H "Content-Type: application/json" \
     -d '{"country": "US", "formData": {"national_id": "12345"}}'
```
