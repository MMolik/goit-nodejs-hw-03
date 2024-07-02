const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const contactRoutes = require('./routes/api/contacts');

const app = express();

const contactsPath = '/Users/molikos/Desktop/GoIT/goit-nodejs-hw-01/goit-nodejs-hw-03/models/contacts.json';

app.locals.contactsPath = contactsPath;

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

app.use('/api/contacts', contactRoutes); // Upewnij się, że endpoint jest poprawnie skonfigurowany

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Database connection successful'))
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

module.exports = app;
