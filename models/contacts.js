const fs = require('fs');
const path = require('path');

const contactsPath = path.join(__dirname, 'contacts.json');

function getContacts() {
  try {
    const contactsData = fs.readFileSync(contactsPath, 'utf8');
    const contacts = JSON.parse(contactsData);
    return contacts;
  } catch (error) {
    console.error('Error reading contacts file:', error);
    return [];
  }
}

module.exports = {
  getContacts,
  // inne funkcje do manipulacji danymi kontaktowymi, jak dodawanie, usuwanie, aktualizacja, itp.
};
