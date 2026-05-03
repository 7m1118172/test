const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Serve favicon from root
app.get('/DENTALIA%20LUXE.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'DENTALIA LUXE.png'));
});
app.get('/DENTALIA LUXE.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'DENTALIA LUXE.png'));
});

// قاعدة البيانات
let database = {
  settings: {},
  appointments: [],
  expenses: [],
  articles: [],
  doctors: [],
  services: []
};

const dbFile = path.join(__dirname, 'data.json');
if (fs.existsSync(dbFile)) {
  database = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  if (!database.expenses) database.expenses = [];
}

function saveData() {
  fs.writeFileSync(dbFile, JSON.stringify(database, null, 2), 'utf8');
}

// ═══ Routes ═══
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public.html')));
app.get('/doctors', (req, res) => res.sendFile(path.join(__dirname, 'doctors.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, 'services.html')));
app.get('/articles', (req, res) => res.sendFile(path.join(__dirname, 'articles.html')));
app.get('/articles/:slug', (req, res) => res.sendFile(path.join(__dirname, 'articles.html')));
app.get('/booking', (req, res) => res.sendFile(path.join(__dirname, 'booking.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// ═══ API ═══
app.get('/api/data', (req, res) => res.json(database));

// Settings Update
app.post('/api/settings', (req, res) => {
    const password = req.body.password;
    if (password !== '123123') return res.status(401).json({ error: 'Unauthorized' });
    database.settings = { ...database.settings, ...req.body.settings };
    saveData();
    res.json({ success: true });
});

// Generic Add/Edit/Delete
const modules = ['doctors', 'articles', 'services', 'appointments', 'expenses'];

modules.forEach(module => {
    // Add
    app.post(`/api/${module}`, (req, res) => {
        const { password, item } = req.body;
        if (password !== '123123' && module !== 'appointments') return res.status(401).json({ error: 'Unauthorized' });
        
        const newItem = { ...item, id: Date.now(), createdAt: new Date().toISOString() };
        database[module].push(newItem);
        saveData();
        res.json({ success: true, item: newItem });
    });

    // Edit
    app.put(`/api/${module}/:id`, (req, res) => {
        const password = req.body.password;
        if (password !== '123123') return res.status(401).json({ error: 'Unauthorized' });
        
        const id = parseInt(req.params.id);
        const index = database[module].findIndex(i => i.id === id);
        if (index !== -1) {
            database[module][index] = { ...database[module][index], ...req.body.item };
            saveData();
            res.json({ success: true, item: database[module][index] });
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    });

    // Delete
    app.delete(`/api/${module}/:id`, (req, res) => {
        const password = req.query.password;
        if (password !== '123123') return res.status(401).json({ error: 'Unauthorized' });
        
        const id = parseInt(req.params.id);
        database[module] = database[module].filter(i => i.id !== id);
        saveData();
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
  console.log(`✅ Dental Clinic Server running on http://localhost:${PORT}`);
});
