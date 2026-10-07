const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, requireEnseignant, requireEtudiant } = require('../middleware/auth');

// GET notes de l'étudiant connecté
router.get('/mes-notes', authenticateToken, requireEtudiant, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT n.id, n.note, n.commentaire, n.created_at,
             c.titre AS cours_titre, c.description AS cours_description,
             e.nom AS enseignant_nom, e.prenom AS enseignant_prenom
      FROM notes n
      JOIN cours c ON n.cours_id = c.id
      JOIN enseignants e ON n.enseignant_id = e.id
      WHERE n.etudiant_id = $1
      ORDER BY n.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET tous les étudiants (pour enseignant)
router.get('/etudiants', authenticateToken, requireEnseignant, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nom, prenom, email, matricule FROM etudiants ORDER BY nom'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET notes d'un cours (pour enseignant)
router.get('/cours/:cours_id', authenticateToken, requireEnseignant, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT n.id, n.note, n.commentaire, n.created_at,
             et.nom, et.prenom, et.matricule, et.email
      FROM notes n
      JOIN etudiants et ON n.etudiant_id = et.id
      WHERE n.cours_id = $1 AND n.enseignant_id = $2
      ORDER BY et.nom
    `, [req.params.cours_id, req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST ajouter une note (enseignant seulement)
router.post('/', authenticateToken, requireEnseignant, async (req, res) => {
  const { etudiant_id, cours_id, note, commentaire } = req.body;
  if (!etudiant_id || !cours_id || note === undefined) {
    return res.status(400).json({ message: 'etudiant_id, cours_id et note sont requis' });
  }
  if (note < 0 || note > 20) {
    return res.status(400).json({ message: 'La note doit être entre 0 et 20' });
  }
  try {
    const result = await pool.query(`
      INSERT INTO notes (etudiant_id, cours_id, note, commentaire, enseignant_id)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (etudiant_id, cours_id)
      DO UPDATE SET note=$3, commentaire=$4, created_at=NOW()
      RETURNING *
    `, [etudiant_id, cours_id, note, commentaire, req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// DELETE supprimer une note
router.delete('/:id', authenticateToken, requireEnseignant, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM notes WHERE id=$1 AND enseignant_id=$2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Note non trouvée ou non autorisée' });
    res.json({ message: 'Note supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
