# Dynamic Form System

This project is a **dynamic form management system** that allows form fields to be customized based on the user's country. It ensures compliance with local regulations by hiding, requiring, or allowing certain fields dynamically.

## Features

- Dynamically renders form fields based on country-specific rules
- Supports required and optional fields per country
- Stores form submissions with country of submission
- Provides a REST API for frontend-backend communication
- Implements ZOD validation after receiving user input

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

## API Endpoints

🔹 Get Form Fields for a Country
```
GET /api/form/:country
```
Returns the form fields for the given country.

🔹 Get Form Countries List
```
GET /api/countries
```
Returns the full list of countries.


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
    "phone": "5551234643"
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
     -d '{
       "country": "US",
       "formData": {
         "dob": "01-01-1990"
       }
     }'
```
