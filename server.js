const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Middleware configuration
app.use(cors());
app.use(express.json());

// Setup database file path
const DATA_FILE = path.join(__dirname, 'data.json');

// Helper function to save notes to the JSON file
const writeNotes = (notesArray) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(notesArray, null, 2));
    } catch (error) {
        console.error("Error writing data to file:", error);
    }
};

// Global memory array safely initialized on server startup
let notes = [];
try {
    if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        notes = fileContent ? JSON.parse(fileContent) : [];
    } else {
        writeNotes([]);
    }
} catch (error) {
    console.error("Error initializing data file:", error);
    notes = []; // Fallback to an empty array if parsing fails
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. GET /notes - Fetch all notes
app.get('/notes', (req, res) => {
    res.json(notes);
});

// 2. POST /notes - Add a new note
app.post('/notes', (req, res) => {
    const { title, content } = req.body;

    // Simple validation
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    const newNote = {
        id: Date.now().toString(), // Generate a unique string ID
        title,
        content
    };

    notes.push(newNote);
    writeNotes(notes);
    res.status(201).json(newNote);
});

// 3. DELETE /notes/:id - Delete a note by ID
app.delete('/notes/:id', (req, res) => {
    const { id } = req.params;

    const noteExists = notes.some(note => note.id === id);
    if (!noteExists) {
        return res.status(404).json({ error: 'Note not found' });
    }

    notes = notes.filter(note => note.id !== id);
    writeNotes(notes);
    res.json({ message: 'Note deleted successfully' });
});

// ----------------------------------------------------
// START SERVER
// ----------------------------------------------------
// Bind dynamically to Render's assigned port and open to all external traffic ('0.0.0.0')
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is successfully running on port ${PORT}`);
});
