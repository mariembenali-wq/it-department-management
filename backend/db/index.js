const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'universite_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'mariam',
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS enseignants (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        mot_de_passe VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS etudiants (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        mot_de_passe VARCHAR(255) NOT NULL,
        matricule VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cours (
        id SERIAL PRIMARY KEY,
        titre VARCHAR(200) NOT NULL,
        description TEXT,
        enseignant_id INTEGER REFERENCES enseignants(id) ON DELETE CASCADE,
        fichier_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS emplois_du_temps (
        id SERIAL PRIMARY KEY,
        cours_id INTEGER REFERENCES cours(id) ON DELETE CASCADE,
        jour VARCHAR(20) NOT NULL,
        heure_debut TIME NOT NULL,
        heure_fin TIME NOT NULL,
        salle VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        etudiant_id INTEGER REFERENCES etudiants(id) ON DELETE CASCADE,
        cours_id INTEGER REFERENCES cours(id) ON DELETE CASCADE,
        note NUMERIC(5,2) NOT NULL,
        commentaire TEXT,
        enseignant_id INTEGER REFERENCES enseignants(id),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(etudiant_id, cours_id)
      );
    `);
    console.log('✅ Base de données initialisée avec succès');
  } catch (err) {
    console.error('❌ Erreur initialisation DB:', err);
  }
};

module.exports = { pool, initDB };
