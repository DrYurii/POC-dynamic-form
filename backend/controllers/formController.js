const { getFormFieldsByCountry } = require('../models/formModel');

const getFormSchema = async (req, res) => {
    const { country } = req.params;
    try {
        const fields = await getFormFieldsByCountry(country);
        res.json(fields);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};

module.exports = { getFormSchema };