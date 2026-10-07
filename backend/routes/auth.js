const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

// Inscription étudiant
router.post('/etudiant/register', async (req, res) => {
  const { nom, prenom, email, mot_de_passe, matricule } = req.body;

  if (!nom || !prenom || !email || !mot_de_passe || !matricule) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    const exists = await pool.query(
      'SELECT id FROM etudiants WHERE email=$1 OR matricule=$2',
      [email, matricule]
    );

    if (exists.rows.length > 0) {
      return res.status(409).json({ message: 'Email ou matricule déjà utilisé' });
    }

    const result = await pool.query(
      'INSERT INTO etudiants (nom, prenom, email, mot_de_passe, matricule) VALUES ($1,$2,$3,$4,$5) RETURNING id, nom, prenom, email, matricule',
      [nom, prenom, email, mot_de_passe, matricule]
    );

    res.status(201).json({
      message: 'Inscription réussie',
      etudiant: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


// Connexion étudiant
router.post('/etudiant/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM etudiants WHERE email=$1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    const etudiant = result.rows[0];

    // direct comparison (NO HASH)
    if (mot_de_passe !== etudiant.mot_de_passe) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: etudiant.id, role: 'etudiant', nom: etudiant.nom, prenom: etudiant.prenom },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: etudiant.id,
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        email: etudiant.email,
        matricule: etudiant.matricule,
        role: 'etudiant'
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


// Enseignant register
router.post('/enseignant/register', async (req, res) => {
  const { nom, prenom, email, mot_de_passe } = req.body;

  if (!nom || !prenom || !email || !mot_de_passe) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    const exists = await pool.query(
      'SELECT id FROM enseignants WHERE email=$1',
      [email]
    );

    if (exists.rows.length > 0) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    const result = await pool.query(
      'INSERT INTO enseignants (nom, prenom, email, mot_de_passe) VALUES ($1,$2,$3,$4) RETURNING id, nom, prenom, email',
      [nom, prenom, email, mot_de_passe]
    );

    res.status(201).json({
      message: 'Inscription réussie',
      enseignant: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


// =====================
// Enseignant login
// =====================
router.post('/enseignant/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM enseignants WHERE email=$1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }

    const enseignant = result.rows[0];

    if (mot_de_passe !== enseignant.mot_de_passe) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: enseignant.id, role: 'enseignant', nom: enseignant.nom, prenom: enseignant.prenom },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: enseignant.id,
        nom: enseignant.nom,
        prenom: enseignant.prenom,
        email: enseignant.email,
        role: 'enseignant'
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;