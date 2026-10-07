const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Token invalide' });
    req.user = user;
    next();
  });
};

const requireEnseignant = (req, res, next) => {
  if (req.user.role !== 'enseignant') {
    return res.status(403).json({ message: 'Accès réservé aux enseignants' });
  }
  next();
};

const requireEtudiant = (req, res, next) => {
  if (req.user.role !== 'etudiant') {
    return res.status(403).json({ message: 'Accès réservé aux étudiants' });
  }
  next();
};

module.exports = { authenticateToken, requireEnseignant, requireEtudiant };
