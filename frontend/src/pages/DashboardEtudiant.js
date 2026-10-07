import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMesNotes, getCours, getEmploi } from '../services/api';
import './Dashboard.css';

const DashboardEtudiant = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState([]);
  const [cours, setCours] = useState([]);
  const [emplois, setEmplois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCours, setSelectedCours] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, coursRes] = await Promise.all([getMesNotes(), getCours()]);
        setNotes(notesRes.data);
        setCours(coursRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchEmploi = async (coursId) => {
    try {
      const res = await getEmploi(coursId);
      setEmplois(res.data);
      setSelectedCours(coursId);
    } catch (err) {
      console.error(err);
    }
  };

  const moyenne = notes.length ? (notes.reduce((s, n) => s + parseFloat(n.note), 0) / notes.length).toFixed(2) : '-';

  const getGradeColor = (note) => {
    if (note >= 16) return '#22c55e';
    if (note >= 12) return '#3b82f6';
    if (note >= 10) return '#f59e0b';
    return '#ef4444';
  };

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Chargement...</p></div>;

  return (
    <div className="dashboard-container student-dash">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">🎓</div>
          <span>UniVerse</span>
        </div>
        <div className="user-info">
          <div className="user-avatar">{user?.prenom?.[0]}{user?.nom?.[0]}</div>
          <div>
            <p className="user-name">{user?.prenom} {user?.nom}</p>
            <p className="user-role">Étudiant · {user?.matricule}</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button className={activeTab === 'notes' ? 'active' : ''} onClick={() => setActiveTab('notes')}>
            📊 Mes Notes
          </button>
          <button className={activeTab === 'cours' ? 'active' : ''} onClick={() => setActiveTab('cours')}>
            📚 Mes Cours
          </button>
          <button className={activeTab === 'emploi' ? 'active' : ''} onClick={() => setActiveTab('emploi')}>
            📅 Emploi du Temps
          </button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>🚪 Déconnexion</button>
      </aside>

      <main className="main-content">
        {activeTab === 'notes' && (
          <div className="tab-content">
            <div className="page-header">
              <h1>Mes Notes</h1>
              <p>Résultats académiques</p>
            </div>

            <div className="stats-row">
              <div className="stat-card">
                <span className="stat-value">{notes.length}</span>
                <span className="stat-label">Cours évalués</span>
              </div>
              <div className="stat-card">
                <span className="stat-value" style={{ color: getGradeColor(parseFloat(moyenne)) }}>{moyenne}/20</span>
                <span className="stat-label">Moyenne générale</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{notes.filter(n => n.note >= 10).length}</span>
                <span className="stat-label">Cours validés</span>
              </div>
            </div>

            {notes.length === 0 ? (
              <div className="empty-state">
                <span>📊</span>
                <p>Aucune note disponible pour le moment</p>
              </div>
            ) : (
              <div className="notes-grid">
                {notes.map(note => (
                  <div className="note-card" key={note.id}>
                    <div className="note-header">
                      <h3>{note.cours_titre}</h3>
                      <div className="note-badge" style={{ background: getGradeColor(note.note) }}>
                        {note.note}/20
                      </div>
                    </div>
                    <p className="note-teacher">Prof. {note.enseignant_prenom} {note.enseignant_nom}</p>
                    {note.commentaire && <p className="note-comment">💬 {note.commentaire}</p>}
                    <div className="note-bar">
                      <div className="note-bar-fill" style={{ width: `${(note.note / 20) * 100}%`, background: getGradeColor(note.note) }}></div>
                    </div>
                    <p className="note-date">{new Date(note.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'cours' && (
          <div className="tab-content">
            <div className="page-header">
              <h1>Mes Cours</h1>
              <p>{cours.length} cours disponibles</p>
            </div>
            {cours.length === 0 ? (
              <div className="empty-state"><span>📚</span><p>Aucun cours disponible</p></div>
            ) : (
              <div className="cours-grid">
                {cours.map(c => (
                  <div className="cours-card" key={c.id}>
                    <div className="cours-icon">📘</div>
                    <h3>{c.titre}</h3>
                    <p className="cours-teacher">👨‍🏫 {c.enseignant_prenom} {c.enseignant_nom}</p>
                    {c.description && <p className="cours-desc">{c.description}</p>}
                    {c.fichier_url && (
                      <a href={c.fichier_url} target="_blank" rel="noopener noreferrer" className="cours-link">
                        📎 Télécharger le cours
                      </a>
                    )}
                    <button className="view-emploi-btn" onClick={() => { setActiveTab('emploi'); fetchEmploi(c.id); }}>
                      📅 Voir l'emploi du temps
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'emploi' && (
          <div className="tab-content">
            <div className="page-header">
              <h1>Emploi du Temps</h1>
              <p>Planning hebdomadaire</p>
            </div>
            <div className="cours-selector">
              <label>Sélectionner un cours :</label>
              <select onChange={(e) => fetchEmploi(e.target.value)} value={selectedCours || ''}>
                <option value="">-- Choisir un cours --</option>
                {cours.map(c => <option key={c.id} value={c.id}>{c.titre}</option>)}
              </select>
            </div>
            {emplois.length === 0 ? (
              <div className="empty-state"><span>📅</span><p>Sélectionnez un cours pour voir l'emploi du temps</p></div>
            ) : (
              <div className="emploi-grid">
                {jours.map(jour => {
                  const seances = emplois.filter(e => e.jour === jour);
                  return seances.length > 0 ? (
                    <div key={jour} className="jour-card">
                      <h3 className="jour-title">{jour}</h3>
                      {seances.map(s => (
                        <div key={s.id} className="seance">
                          <span className="seance-time">⏰ {s.heure_debut.slice(0,5)} - {s.heure_fin.slice(0,5)}</span>
                          {s.salle && <span className="seance-salle">🏫 {s.salle}</span>}
                        </div>
                      ))}
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardEtudiant;
