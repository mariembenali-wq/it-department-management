import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMesCours, addCours, deleteCours, getEtudiants, addNote, getNotesCours, addEmploi } from '../services/api';
import './Dashboard.css';

const DashboardEnseignant = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cours');
  const [cours, setCours] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [notesCours, setNotesCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const [newCours, setNewCours] = useState({ titre: '', description: '', fichier_url: '' });
  const [newNote, setNewNote] = useState({ etudiant_id: '', cours_id: '', note: '', commentaire: '' });
  const [newEmploi, setNewEmploi] = useState({ cours_id: '', jour: '', heure_debut: '', heure_fin: '', salle: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursRes, etudiantsRes] = await Promise.all([getMesCours(), getEtudiants()]);
        setCours(coursRes.data);
        setEtudiants(etudiantsRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const handleAddCours = async (e) => {
    e.preventDefault();
    try {
      const res = await addCours(newCours);
      setCours([res.data, ...cours]);
      setNewCours({ titre: '', description: '', fichier_url: '' });
      showMsg('✅ Cours ajouté avec succès !');
    } catch (err) { showMsg('❌ ' + (err.response?.data?.message || 'Erreur')); }
  };

  const handleDeleteCours = async (id) => {
    if (!window.confirm('Supprimer ce cours ?')) return;
    try {
      await deleteCours(id);
      setCours(cours.filter(c => c.id !== id));
      showMsg('✅ Cours supprimé');
    } catch (err) { showMsg('❌ Erreur lors de la suppression'); }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      await addNote(newNote);
      if (newNote.cours_id) {
        const res = await getNotesCours(newNote.cours_id);
        setNotesCours(res.data);
      }
      setNewNote({ etudiant_id: '', cours_id: newNote.cours_id, note: '', commentaire: '' });
      showMsg('✅ Note enregistrée !');
    } catch (err) { showMsg('❌ ' + (err.response?.data?.message || 'Erreur')); }
  };

  const handleCoursChange = async (coursId) => {
    setNewNote({ ...newNote, cours_id: coursId });
    if (coursId) {
      try {
        const res = await getNotesCours(coursId);
        setNotesCours(res.data);
      } catch (err) { console.error(err); }
    }
  };

  const handleAddEmploi = async (e) => {
    e.preventDefault();
    try {
      await addEmploi(newEmploi.cours_id, newEmploi);
      setNewEmploi({ cours_id: newEmploi.cours_id, jour: '', heure_debut: '', heure_fin: '', salle: '' });
      showMsg('✅ Créneau ajouté !');
    } catch (err) { showMsg('❌ ' + (err.response?.data?.message || 'Erreur')); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Chargement...</p></div>;

  return (
    <div className="dashboard-container teacher-dash">
      {msg && <div className={`toast ${msg.startsWith('✅') ? 'toast-success' : 'toast-error'}`}>{msg}</div>}

      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">🎓</div>
          <span>UniVerse</span>
        </div>
        <div className="user-info">
          <div className="user-avatar teacher-avatar">{user?.prenom?.[0]}{user?.nom?.[0]}</div>
          <div>
            <p className="user-name">{user?.prenom} {user?.nom}</p>
            <p className="user-role">Enseignant</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button className={activeTab === 'cours' ? 'active' : ''} onClick={() => setActiveTab('cours')}>
            📚 Gérer les Cours
          </button>
          <button className={activeTab === 'notes' ? 'active' : ''} onClick={() => setActiveTab('notes')}>
            📝 Saisir Notes
          </button>
          <button className={activeTab === 'emploi' ? 'active' : ''} onClick={() => setActiveTab('emploi')}>
            📅 Emploi du Temps
          </button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>🚪 Déconnexion</button>
      </aside>

      <main className="main-content">
        {activeTab === 'cours' && (
          <div className="tab-content">
            <div className="page-header">
              <h1>Gestion des Cours</h1>
              <p>{cours.length} cours créés</p>
            </div>

            <div className="form-card">
              <h2>➕ Ajouter un nouveau cours</h2>
              <form onSubmit={handleAddCours} className="dash-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Titre du cours *</label>
                    <input value={newCours.titre} onChange={e => setNewCours({...newCours, titre: e.target.value})} placeholder="Ex: Algorithmique avancée" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={newCours.description} onChange={e => setNewCours({...newCours, description: e.target.value})} placeholder="Décrivez le contenu du cours..." rows={3} />
                </div>
                <div className="form-group">
                  <label>Lien du fichier (URL)</label>
                  <input value={newCours.fichier_url} onChange={e => setNewCours({...newCours, fichier_url: e.target.value})} placeholder="https://..." type="url" />
                </div>
                <button type="submit" className="submit-btn teacher-submit">Ajouter le cours</button>
              </form>
            </div>

            <h2 className="section-title">Mes cours</h2>
            {cours.length === 0 ? (
              <div className="empty-state"><span>📚</span><p>Aucun cours créé</p></div>
            ) : (
              <div className="cours-grid">
                {cours.map(c => (
                  <div className="cours-card" key={c.id}>
                    <div className="cours-icon">📘</div>
                    <h3>{c.titre}</h3>
                    {c.description && <p className="cours-desc">{c.description}</p>}
                    <p className="cours-stat">👥 {c.nb_notes} étudiant(s) évalué(s)</p>
                    <button className="delete-btn" onClick={() => handleDeleteCours(c.id)}>🗑️ Supprimer</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="tab-content">
            <div className="page-header">
              <h1>Saisie des Notes</h1>
              <p>Évaluez vos étudiants</p>
            </div>

            <div className="form-card">
              <h2>📝 Attribuer une note</h2>
              <form onSubmit={handleAddNote} className="dash-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Cours *</label>
                    <select value={newNote.cours_id} onChange={e => handleCoursChange(e.target.value)} required>
                      <option value="">Sélectionner un cours</option>
                      {cours.map(c => <option key={c.id} value={c.id}>{c.titre}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Étudiant *</label>
                    <select value={newNote.etudiant_id} onChange={e => setNewNote({...newNote, etudiant_id: e.target.value})} required>
                      <option value="">Sélectionner un étudiant</option>
                      {etudiants.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom} ({e.matricule})</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Note (0 - 20) *</label>
                    <input type="number" min="0" max="20" step="0.25" value={newNote.note} onChange={e => setNewNote({...newNote, note: e.target.value})} placeholder="Ex: 14.5" required />
                  </div>
                  <div className="form-group">
                    <label>Commentaire</label>
                    <input value={newNote.commentaire} onChange={e => setNewNote({...newNote, commentaire: e.target.value})} placeholder="Très bon travail..." />
                  </div>
                </div>
                <button type="submit" className="submit-btn teacher-submit">Enregistrer la note</button>
              </form>
            </div>

            {notesCours.length > 0 && (
              <>
                <h2 className="section-title">Notes du cours sélectionné</h2>
                <div className="notes-table-wrap">
                  <table className="notes-table">
                    <thead>
                      <tr><th>Étudiant</th><th>Matricule</th><th>Note</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {notesCours.map(n => (
                        <tr key={n.id}>
                          <td>{n.prenom} {n.nom}</td>
                          <td><span className="matricule-tag">{n.matricule}</span></td>
                          <td><span className="note-badge-sm" style={{ background: n.note >= 10 ? '#22c55e22' : '#ef444422', color: n.note >= 10 ? '#22c55e' : '#ef4444' }}>{n.note}/20</span></td>
                          <td>{new Date(n.created_at).toLocaleDateString('fr-FR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'emploi' && (
          <div className="tab-content">
            <div className="page-header">
              <h1>Emploi du Temps</h1>
              <p>Planifiez vos séances</p>
            </div>

            <div className="form-card">
              <h2>📅 Ajouter un créneau</h2>
              <form onSubmit={handleAddEmploi} className="dash-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Cours *</label>
                    <select value={newEmploi.cours_id} onChange={e => setNewEmploi({...newEmploi, cours_id: e.target.value})} required>
                      <option value="">Sélectionner un cours</option>
                      {cours.map(c => <option key={c.id} value={c.id}>{c.titre}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Jour *</label>
                    <select value={newEmploi.jour} onChange={e => setNewEmploi({...newEmploi, jour: e.target.value})} required>
                      <option value="">Sélectionner</option>
                      {['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'].map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Heure début *</label>
                    <input type="time" value={newEmploi.heure_debut} onChange={e => setNewEmploi({...newEmploi, heure_debut: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Heure fin *</label>
                    <input type="time" value={newEmploi.heure_fin} onChange={e => setNewEmploi({...newEmploi, heure_fin: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Salle</label>
                    <input value={newEmploi.salle} onChange={e => setNewEmploi({...newEmploi, salle: e.target.value})} placeholder="Ex: Amphi A" />
                  </div>
                </div>
                <button type="submit" className="submit-btn teacher-submit">Ajouter le créneau</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardEnseignant;
