const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json'); // Fixed to double underscore


// Middleware
app.use(cors());
app.use(express.json());

// Helper functions to read/write JSON file
const readNotes = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeNotes = (notes) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2));
};

// GET /notes - Fetch all notes
app.get('/notes', (req, res) => {
    const notes = readNotes();
    res.json(notes);
});

// POST /notes - Create a new note
app.post("/notes", (req, res) => {


    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    const notes = readNotes();
    const newNote = {
        id: Date.now().toString(), // Simple unique ID
        title,
        content
    };

    notes.push(newNote);
});
writeNotes(notes);
res.status(201).json(newNote);

// DELETE /notes/:id - Delete a note by ID
app.delete('/notes/:id', (req, res) => {
    const { id } = req.params;
    let notes = readNotes();

    const noteExists = notes.some(note => note.id === id);
    if (!noteExists) {
        return res.status(404).json({ error: 'Note not found' });
    }

    notes = notes.filter(note => note.id !== id);
    writeNotes(notes);
    res.json({ message: 'Note deleted successfully' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('Server running on port ${PORT}');
});
const PORT = process.env.PORT || 1000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('Server is running on port ${PORT}');
});