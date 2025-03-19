const pool = require('../db');

const getFormFieldsByCountry = async (country) => {
    const result = await pool.query(
        `SELECT name, label, type, 
                CASE 
                    WHEN $1 = ANY(prohibited_countries) THEN 'hidden'
                    WHEN $1 = ANY(mandatory_countries) THEN 'required'
                    WHEN $1 = ANY(optional_countries) THEN 'optional'
                    ELSE 'hidden'
                END AS visibility
         FROM form_fields`, 
        [country]
    );
    return result.rows.filter(field => field.visibility !== 'hidden');
};

module.exports = { getFormFieldsByCountry };