const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const fs = require('fs/promises');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

const contactsPath = path.join(__dirname, 'models', 'contacts.json');

const readContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error('Error reading contacts file');
  }
};

const writeContacts = async (contacts) => {
  try {
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  } catch (error) {
    throw new Error('Error writing contacts file');
  }
};

app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await readContacts();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const contacts = await readContacts();
    const contact = contacts.find((c) => c.id === id);

    if (!contact) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  const { name, email, phone } = req.body;

  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
  });

  const validation = schema.validate({ name, email, phone });

  if (validation.error) {
    return res.status(400).json({ message: validation.error.details[0].message });
  }

  try {
    const contacts = await readContacts();
    const newContact = { id: uuidv4(), name, email, phone };
    contacts.push(newContact);
    await writeContacts(contacts);
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const contacts = await readContacts();
    const index = contacts.findIndex((c) => c.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Not found' });
    }

    contacts.splice(index, 1);
    await writeContacts(contacts);
    res.status(200).json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  const schema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string(),
  });

  const validation = schema.validate(req.body);

  if (validation.error) {
    return res.status(400).json({ message: validation.error.details[0].message });
  }

  try {
    const contacts = await readContacts();
    const index = contacts.findIndex((c) => c.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Not found' });
    }

    contacts[index] = { ...contacts[index], ...req.body };
    await writeContacts(contacts);
    res.status(200).json(contacts[index]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

module.exports = app;
