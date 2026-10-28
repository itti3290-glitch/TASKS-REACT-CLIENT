import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, NavLink, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { deleteVolunteer, fetchPatients, fetchVolunteers, type Volunteer } from '../api';
import AddPatientForm from './AddPatientForm';
import AddVolunteerForm from './AddVolunteerForm';
import AdminPatientCard from './AdminPatientCard';
import ErrorMessage from './ErrorMessage';
import Loader from './Loader';

function AdminPage() {
  const { token, user } = useAuth();
  const { tab } = useParams();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const patients = useQuery({
    queryKey: ['patients', token],
    queryFn: () => fetchPatients(token!),
    enabled: token !== null,
  });

  const volunteers = useQuery({
    queryKey: ['volunteers', token],
    queryFn: () => fetchVolunteers(token!),
    enabled: token !== null && user?.role === 'admin',
  });

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (userId: number) => deleteVolunteer(token!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  function handleDeleteVolunteer(volunteer: Volunteer) {
    const sure = window.confirm(
      `למחוק את ${volunteer.full_name}?\nההרשמות שלו למשימות יימחקו, והוא יוסר מכל הצוותים. אי אפשר לשחזר.`
    );
    if (sure) deleteMutation.mutate(volunteer.id);
  }

  if (!token) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/" />;
  if (tab !== 'patients' && tab !== 'volunteers') return <Navigate to="/admin/patients" />;

  const text = search.trim().toLowerCase();
  const shownPatients = (patients.data ?? []).filter(
    (p) => p.full_name.toLowerCase().includes(text) || p.patient_code.toLowerCase().includes(text)
  );
  const shownVolunteers = (volunteers.data ?? []).filter(
    (v) => v.full_name.toLowerCase().includes(text) || v.email.toLowerCase().includes(text)
  );

  return (
    <section className="admin">
      <h1>ניהול</h1>

      <nav className="tabs">
        <NavLink to="/admin/patients" onClick={() => setShowForm(false)}>
          מטופלים ({patients.data?.length ?? 0})
        </NavLink>
        <NavLink to="/admin/volunteers" onClick={() => setShowForm(false)}>
          מתנדבים ({volunteers.data?.length ?? 0})
        </NavLink>
      </nav>

      <div className="tab-toolbar">
        <input
          className="search-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={tab === 'patients' ? 'חיפוש לפי שם או קוד מטופל' : 'חיפוש לפי שם או אימייל'}
        />
        {!showForm && (
          <button className="primary-button" onClick={() => setShowForm(true)}>
            {tab === 'patients' ? '+ מטופל חדש' : '+ מתנדב חדש'}
          </button>
        )}
      </div>

      {showForm && tab === 'patients' && <AddPatientForm onDone={() => setShowForm(false)} />}
      {showForm && tab === 'volunteers' && <AddVolunteerForm onDone={() => setShowForm(false)} />}

      {tab === 'patients' && (
        <>
          {patients.isPending && <Loader />}
          <ErrorMessage message={patients.error?.message} />
          {patients.data && shownPatients.length === 0 && <p className="messages-empty">לא נמצאו מטופלים.</p>}
          <div className="admin-list">
            {shownPatients.map((patient) => (
              <AdminPatientCard key={patient.id} patient={patient} volunteers={volunteers.data ?? []} />
            ))}
          </div>
        </>
      )}

      {tab === 'volunteers' && (
        <>
          {volunteers.isPending && <Loader />}
          <ErrorMessage message={volunteers.error?.message} />
          {volunteers.data && shownVolunteers.length === 0 && <p className="messages-empty">לא נמצאו מתנדבים.</p>}
          <div className="admin-list">
            {shownVolunteers.map((v) => (
              <article key={v.id} className="admin-card">
                <h3>{v.full_name}</h3>
                <p className="admin-card-sub">
                  {v.email} · {v.phone}
                </p>
                <p className="admin-card-sub">החודש: {v.this_month_count} משימות</p>
                <p className="admin-card-label">מטופלים</p>
                <div className="team-list">
                  {v.patients.length === 0 && <span className="messages-empty">עדיין לא שובץ.</span>}
                  {v.patients.map((p) => (
                    <span key={p.id} className="team-member">
                      {p.full_name}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className="delete-button"
                  onClick={() => handleDeleteVolunteer(v)}
                  disabled={deleteMutation.isPending}
                >
                  מחיקת מתנדב
                </button>
              </article>
            ))}
          </div>
          <ErrorMessage message={deleteMutation.error?.message} />
        </>
      )}
    </section>
  );
}

export default AdminPage;
