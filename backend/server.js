const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDB } = require('./db');
const authRoutes = require('./routes/auth');
const coursRoutes = require('./routes/cours');
const notesRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cours', coursRoutes);
app.use('/api/notes', notesRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '🎓 Université API opérationnelle' });
});

// Démarrage
const start = async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
  });
};

start();