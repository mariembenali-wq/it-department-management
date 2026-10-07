# 🎓 UniVerse — Plateforme Éducative Universitaire

Application web complète avec **React** (frontend), **Node.js/Express** (backend) et **PostgreSQL** (base de données).

---

## 📁 Structure du projet

```
universite-app/
├── backend/          ← API Node.js + Express
│   ├── db/           ← Connexion et schéma PostgreSQL
│   ├── middleware/   ← Authentification JWT
│   ├── routes/       ← Routes API (auth, cours, notes)
│   ├── server.js     ← Point d'entrée du serveur
│   ├── .env.example  ← Variables d'environnement (à copier)
│   └── package.json
└── frontend/         ← Application React
    ├── src/
    │   ├── context/  ← AuthContext (gestion session)
    │   ├── pages/    ← Home, Login, Dashboards
    │   └── services/ ← Appels API (axios)
    ├── public/
    └── package.json
```

---

## ⚙️ Installation

### 1. Prérequis
- Node.js v18+
- PostgreSQL 14+
- npm ou yarn

### 2. Base de données PostgreSQL

```sql
-- Dans psql ou pgAdmin :
CREATE DATABASE universite_db;
```

Les tables sont créées **automatiquement** au démarrage du serveur.

### 3. Backend

```bash
cd backend

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos paramètres PostgreSQL

# Installer les dépendances
npm install

# Démarrer en développement
npm run dev

# Démarrer en production
npm start
```

Le serveur démarre sur **http://localhost:5000**

### 4. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer
npm start
```

L'application s'ouvre sur **http://localhost:3000**

---

## 🔌 Variables d'environnement (backend/.env)

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=universite_db
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_secret_jwt_tres_long_et_securise
FRONTEND_URL=http://localhost:3000
```

---

## 📡 API Endpoints

### 🔐 Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/auth/etudiant/register | Inscription étudiant |
| POST | /api/auth/etudiant/login | Connexion étudiant |
| POST | /api/auth/enseignant/register | Inscription enseignant |
| POST | /api/auth/enseignant/login | Connexion enseignant |

### 📚 Cours
| Méthode | Route | Rôle requis |
|---------|-------|-------------|
| GET | /api/cours | Tous |
| GET | /api/cours/mes-cours | Enseignant |
| POST | /api/cours | Enseignant |
| PUT | /api/cours/:id | Enseignant |
| DELETE | /api/cours/:id | Enseignant |
| GET | /api/cours/:id/emploi | Tous |
| POST | /api/cours/:id/emploi | Enseignant |

### 📝 Notes
| Méthode | Route | Rôle requis |
|---------|-------|-------------|
| GET | /api/notes/mes-notes | Étudiant |
| GET | /api/notes/etudiants | Enseignant |
| GET | /api/notes/cours/:id | Enseignant |
| POST | /api/notes | Enseignant |
| DELETE | /api/notes/:id | Enseignant |

---

## 🎯 Fonctionnalités

### Page d'accueil
- Choix du rôle : Étudiant ou Enseignant

### Espace Étudiant
- Inscription / Connexion avec matricule
- 📊 Voir ses notes avec moyenne générale
- 📚 Consulter tous les cours disponibles
- 📅 Voir l'emploi du temps par cours

### Espace Enseignant
- Inscription / Connexion
- 📚 Ajouter / Supprimer ses cours
- 📝 Saisir des notes pour les étudiants (0 à 20)
- 📅 Planifier l'emploi du temps (jour, heure, salle)

---

## 🔒 Sécurité
- Mots de passe hashés avec **bcryptjs**
- Authentification par **JWT** (24h d'expiration)
- Routes protégées par rôle (étudiant / enseignant)
- Un étudiant ne peut voir que ses propres notes
