const express = require('express');
const { getFormSchema } = require('./controllers/formController');

const router = express.Router();

router.get('/form/:country', getFormSchema);

module.exports = router;