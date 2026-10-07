const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, requireEnseignant } = require('../middleware/auth');

// GET tous les cours (accès pour tous les utilisateurs connectés)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.titre, c.description, c.fichier_url, c.created_at,
             e.nom AS enseignant_nom, e.prenom AS enseignant_prenom
      FROM cours c
      JOIN enseignants e ON c.enseignant_id = e.id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET cours d'un enseignant spécifique
router.get('/mes-cours', authenticateToken, requireEnseignant, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM notes n WHERE n.cours_id = c.id) AS nb_notes
      FROM cours c
      WHERE c.enseignant_id = $1
      ORDER BY c.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST ajouter un cours (enseignant seulement)
router.post('/', authenticateToken, requireEnseignant, async (req, res) => {
  const { titre, description, fichier_url } = req.body;
  if (!titre) return res.status(400).json({ message: 'Le titre est requis' });
  try {
    const result = await pool.query(
      'INSERT INTO cours (titre, description, enseignant_id, fichier_url) VALUES ($1,$2,$3,$4) RETURNING *',
      [titre, description, req.user.id, fichier_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// PUT modifier un cours
router.put('/:id', authenticateToken, requireEnseignant, async (req, res) => {
  const { titre, description, fichier_url } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cours SET titre=$1, description=$2, fichier_url=$3 WHERE id=$4 AND enseignant_id=$5 RETURNING *',
      [titre, description, fichier_url, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Cours non trouvé ou non autorisé' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// DELETE supprimer un cours
router.delete('/:id', authenticateToken, requireEnseignant, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM cours WHERE id=$1 AND enseignant_id=$2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Cours non trouvé ou non autorisé' });
    res.json({ message: 'Cours supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET emploi du temps d'un cours
router.get('/:id/emploi', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM emplois_du_temps WHERE cours_id=$1 ORDER BY jour, heure_debut',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST ajouter emploi du temps
router.post('/:id/emploi', authenticateToken, requireEnseignant, async (req, res) => {
  const { jour, heure_debut, heure_fin, salle } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO emplois_du_temps (cours_id, jour, heure_debut, heure_fin, salle) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.params.id, jour, heure_debut, heure_fin, salle]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
