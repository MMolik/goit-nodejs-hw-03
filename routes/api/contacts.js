const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Ścieżka do pliku contacts.json
const contactsPath =
  "/Users/molikos/Desktop/GoIT/goit-nodejs-hw-01/goit-nodejs-hw-03/models/contacts.json";

// GET /api/contacts - Pobierz wszystkie kontakty
router.get("/", (req, res) => {
  fs.readFile(contactsPath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading contacts file at ${contactsPath}:`, err);
      return res
        .status(500)
        .json({ message: "Server error: Error reading contacts file" });
    }
    try {
      const contacts = JSON.parse(data);
      res.json(contacts);
    } catch (error) {
      console.error("Error parsing contacts data:", error);
      res
        .status(500)
        .json({ message: "Server error: Error parsing contacts data" });
    }
  });
});

// GET /api/contacts/:id - Pobierz kontakt po ID
router.get("/:id", (req, res) => {
  const contactId = req.params.id;

  fs.readFile(contactsPath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading contacts file at ${contactsPath}:`, err);
      return res
        .status(500)
        .json({ message: "Server error: Error reading contacts file" });
    }

    try {
      const contacts = JSON.parse(data);
      const contact = contacts.find((c) => c.id === contactId);

      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      res.json(contact);
    } catch (error) {
      console.error("Error parsing contacts data:", error);
      res
        .status(500)
        .json({ message: "Server error: Error parsing contacts data" });
    }
  });
});

// POST /api/contacts - Dodaj nowy kontakt
router.post("/", (req, res) => {
  const { name, email, phone } = req.body;

  fs.readFile(contactsPath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading contacts file at ${contactsPath}:`, err);
      return res
        .status(500)
        .json({ message: "Server error: Error reading contacts file" });
    }

    try {
      let contacts = JSON.parse(data);

      // Utwórz nowy kontakt
      const newContact = {
        id: uuidv4(),
        name,
        email,
        phone,
      };

      // Dodaj nowy kontakt do listy istniejących kontaktów
      contacts.push(newContact);

      // Zapisz zaktualizowaną listę kontaktów do pliku
      fs.writeFile(contactsPath, JSON.stringify(contacts), (err) => {
        if (err) {
          console.error(`Error writing contacts file at ${contactsPath}:`, err);
          return res
            .status(500)
            .json({ message: "Server error: Error writing contacts file" });
        }
        res.json(newContact);
      });
    } catch (error) {
      console.error("Error parsing contacts data:", error);
      res
        .status(500)
        .json({ message: "Server error: Error parsing contacts data" });
    }
  });
});

// DELETE /api/contacts/:id - Usuń kontakt po ID
router.delete("/:id", (req, res) => {
  const contactId = req.params.id;

  fs.readFile(contactsPath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading contacts file at ${contactsPath}:`, err);
      return res
        .status(500)
        .json({ message: "Server error: Error reading contacts file" });
    }

    try {
      let contacts = JSON.parse(data);

      // Sprawdź czy kontakt istnieje
      const contactIndex = contacts.findIndex((c) => c.id === contactId);

      if (contactIndex === -1) {
        return res.status(404).json({ message: "Contact not found" });
      }

      // Usuń kontakt z listy
      contacts.splice(contactIndex, 1);

      // Zapisz zaktualizowaną listę kontaktów do pliku
      fs.writeFile(contactsPath, JSON.stringify(contacts), (err) => {
        if (err) {
          console.error(`Error writing contacts file at ${contactsPath}:`, err);
          return res
            .status(500)
            .json({ message: "Server error: Error writing contacts file" });
        }
        res.json({ message: "Contact deleted successfully" });
      });
    } catch (error) {
      console.error("Error parsing contacts data:", error);
      res
        .status(500)
        .json({ message: "Server error: Error parsing contacts data" });
    }
  });
});
// PUT /api/contacts/:id - Aktualizuj kontakt po ID
router.put("/:id", (req, res) => {
  const contactId = req.params.id;
  const { name, email, phone } = req.body;

  fs.readFile(contactsPath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading contacts file at ${contactsPath}:`, err);
      return res
        .status(500)
        .json({ message: "Server error: Error reading contacts file" });
    }

    try {
      let contacts = JSON.parse(data);

      // Znajdź index kontaktu do aktualizacji
      const contactIndex = contacts.findIndex((c) => c.id === contactId);

      if (contactIndex === -1) {
        return res.status(404).json({ message: "Contact not found" });
      }

      // Zaktualizuj kontakt
      contacts[contactIndex] = {
        ...contacts[contactIndex],
        name: name || contacts[contactIndex].name,
        email: email || contacts[contactIndex].email,
        phone: phone || contacts[contactIndex].phone,
      };

      // Zapisz zaktualizowaną listę kontaktów do pliku
      fs.writeFile(contactsPath, JSON.stringify(contacts), (err) => {
        if (err) {
          console.error(`Error writing contacts file at ${contactsPath}:`, err);
          return res
            .status(500)
            .json({ message: "Server error: Error writing contacts file" });
        }
        res.json(contacts[contactIndex]);
      });
    } catch (error) {
      console.error("Error parsing contacts data:", error);
      res
        .status(500)
        .json({ message: "Server error: Error parsing contacts data" });
    }
  });
});

// PATCH /api/contacts/:contactId/favorite - Aktualizuj status ulubionego kontaktu
router.patch("/:contactId/favorite", (req, res) => {
  const contactId = req.params.contactId;
  const { favorite } = req.body;

  // Sprawdź czy zostało przesłane pole favorite
  if (favorite === undefined) {
    return res.status(400).json({ message: "Missing field favorite" });
  }

  fs.readFile(contactsPath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading contacts file at ${contactsPath}:`, err);
      return res
        .status(500)
        .json({ message: "Server error: Error reading contacts file" });
    }

    try {
      let contacts = JSON.parse(data);

      // Znajdź kontakt do aktualizacji
      const contactIndex = contacts.findIndex((c) => c.id === contactId);

      if (contactIndex === -1) {
        return res.status(404).json({ message: "Contact not found" });
      }

      // Aktualizuj pole favorite
      contacts[contactIndex].favorite = favorite;

      // Zapisz zaktualizowaną listę kontaktów do pliku
      fs.writeFile(contactsPath, JSON.stringify(contacts), (err) => {
        if (err) {
          console.error(`Error writing contacts file at ${contactsPath}:`, err);
          return res
            .status(500)
            .json({ message: "Server error: Error writing contacts file" });
        }
        res.json(contacts[contactIndex]);
      });
    } catch (error) {
      console.error("Error parsing contacts data:", error);
      res
        .status(500)
        .json({ message: "Server error: Error parsing contacts data" });
    }
  });
});

module.exports = router;
