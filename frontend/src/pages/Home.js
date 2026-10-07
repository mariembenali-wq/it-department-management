import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-bg">
        <div className="bg-circle c1"></div>
        <div className="bg-circle c2"></div>
        <div className="bg-circle c3"></div>
      </div>

      <div className="home-content">
        <div className="home-header">
          <div className="logo-icon">🎓</div>
          <h1 className="home-title">UniVerse</h1>
          <p className="home-subtitle">Plateforme Éducative Universitaire</p>
          <div className="header-divider"></div>
        </div>

        <h2 className="choose-title">Qui êtes-vous ?</h2>
        <p className="choose-subtitle">Sélectionnez votre profil pour accéder à votre espace</p>

        <div className="role-cards">
          <div className="role-card student-card" onClick={() => navigate('/login/etudiant')}>
            <div className="role-icon">👨‍🎓</div>
            <h3>Étudiant</h3>
            <p>Accédez à vos notes, emploi du temps et cours disponibles</p>
            <div className="role-features">
              <span>📊 Mes Notes</span>
              <span>📅 Emploi du Temps</span>
              <span>📚 Mes Cours</span>
            </div>
            <button className="role-btn student-btn">Espace Étudiant →</button>
          </div>

          <div className="role-card teacher-card" onClick={() => navigate('/login/enseignant')}>
            <div className="role-icon">👨‍🏫</div>
            <h3>Enseignant</h3>
            <p>Gérez vos cours, ajoutez des notes et organisez les emplois du temps</p>
            <div className="role-features">
              <span>➕ Ajouter Cours</span>
              <span>📝 Saisir Notes</span>
              <span>🗓️ Planning</span>
            </div>
            <button className="role-btn teacher-btn">Espace Enseignant →</button>
          </div>
        </div>

        <footer className="home-footer">
          <p>© 2024 UniVerse — Plateforme Éducative</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
