import { useState, useEffect } from 'react';
import axios from 'axios';

const country = 'FR'; // Replace with dynamic country detection

const DynamicForm = () => {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [responseMessage, setResponseMessage] = useState('');

  // Fetch form fields based on country
  useEffect(() => {
    axios.get(`http://localhost:3000/api/form/${country}`)
      .then(response => {
        setFields(response.data);
        setFormData(response.data.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}));
      })
      .catch(error => console.error('Error fetching form fields:', error));
  }, []);

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
        country,
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
      <form onSubmit={handleSubmit}>
        {fields.map(field => (
          <div key={field.name}>
            <label>{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              required={field.visibility === 'required'}
            />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );
};

export default DynamicForm;
