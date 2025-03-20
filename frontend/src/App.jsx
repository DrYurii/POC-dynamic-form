import { useState, useEffect } from 'react';
import axios from 'axios';

const DynamicForm = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [responseMessage, setResponseMessage] = useState('');

  // Fetch country list from backend (based on JSON file)
  useEffect(() => {
    axios.get(`http://localhost:3000/api/countries`)
      .then(response => setCountries(response.data))
      .catch(error => console.error('Error fetching country list:', error));
  }, []);

  // Fetch form fields when a country is selected
  useEffect(() => {
    if (!selectedCountry) return;
    
    axios.get(`http://localhost:3000/api/form/${selectedCountry}`)
      .then(response => {
        setFields(response.data);
        setFormData(response.data.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}));
      })
      .catch(error => console.error('Error fetching form fields:', error));
  }, [selectedCountry]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponseMessage('');

    try {
      const response = await axios.post('http://localhost:3000/api/submit-form', {
        country: selectedCountry,
        formData
      });

      setResponseMessage(response.data.message);
    } catch (error) {
      setResponseMessage(error.response?.data?.error || 'Submission failed');
    }
  };

  return (
    <div>
      <h2>Dynamic Form</h2>

      {/* Country Selection Dropdown */}
      <label>Select Country:</label>
      <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
        <option value="">-- Choose a country --</option>
        {countries.map((country) => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>

      {/* Form Fields */}
      {selectedCountry && fields.length > 0 && (
        <form onSubmit={handleSubmit}>
          {fields.map(field => (
            <div key={field.name}>
              <label>{field.label}</label>
              <input
                type={field.type === 'date' ? 'date' : 'text'}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required={field.required}
              />
            </div>
          ))}
          <button type="submit">Submit</button>
        </form>
      )}

      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );
};

export default DynamicForm;
