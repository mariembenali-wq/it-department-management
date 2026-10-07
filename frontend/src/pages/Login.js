import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginEtudiant, loginEnseignant, registerEtudiant, registerEnseignant } from '../services/api';
import './Login.css';

const Login = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', mot_de_passe: '', matricule: '' });

  const isEtudiant = role === 'etudiant';
  const color = isEtudiant ? '#4f46e5' : '#7c3aed';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      if (isRegister) {
        res = isEtudiant ? await registerEtudiant(form) : await registerEnseignant(form);
        setIsRegister(false);
        setError('');
        alert('✅ Inscription réussie ! Vous pouvez maintenant vous connecter.');
        return;
      } else {
        res = isEtudiant
          ? await loginEtudiant({ email: form.email, mot_de_passe: form.mot_de_passe })
          : await loginEnseignant({ email: form.email, mot_de_passe: form.mot_de_passe });
        login(res.data.token, res.data.user);
        navigate(isEtudiant ? '/dashboard/etudiant' : '/dashboard/enseignant');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ '--role-color': color }}>
      <div className="login-bg">
        <div className="login-bg-circle lc1"></div>
        <div className="login-bg-circle lc2"></div>
      </div>

      <Link to="/" className="back-home">← Retour à l'accueil</Link>

      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">{isEtudiant ? '👨‍🎓' : '👨‍🏫'}</div>
          <h2>{isRegister ? 'Inscription' : 'Connexion'}</h2>
          <p>{isEtudiant ? 'Espace Étudiant' : 'Espace Enseignant'}</p>
        </div>

        {error && <div className="error-msg">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <>
              <div className="form-group">
                <label>Prénom</label>
                <input name="prenom" type="text" placeholder="Votre prénom" value={form.prenom} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input name="nom" type="text" placeholder="Votre nom" value={form.nom} onChange={handleChange} required />
              </div>
              {isEtudiant && (
                <div className="form-group">
                  <label>Matricule</label>
                  <input name="matricule" type="text" placeholder="Ex: ETU2024001" value={form.matricule} onChange={handleChange} required />
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="votre@email.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input name="mot_de_passe" type="password" placeholder="••••••••" value={form.mot_de_passe} onChange={handleChange} required />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '⏳ Chargement...' : isRegister ? "S'inscrire" : 'Se connecter'}
          </button>
        </form>

        <div className="login-toggle">
          <p>
            {isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }}>
              {isRegister ? ' Se connecter' : " S'inscrire"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
