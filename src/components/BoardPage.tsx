import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { fetchPatients, fetchTasks } from '../api';
import { sortOptions, sortTasks, type SortOption } from '../utils';
import ErrorMessage from './ErrorMessage';
import Loader from './Loader';
import TasksByType from './TasksByType';
import WeekBoard from './WeekBoard';

type View = 'week' | 'type';

function BoardPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [view, setView] = useState<View>('week');
  const [sortBy, setSortBy] = useState<SortOption>('date');

  const { data, isPending, error } = useQuery({
    queryKey: ['tasks', token],
    queryFn: () => fetchTasks(token!),
    enabled: token !== null,
  });

  const patients = useQuery({
    queryKey: ['patients', token],
    queryFn: () => fetchPatients(token!),
    enabled: token !== null,
  });

  if (!token) return <Navigate to="/login" />;
  if (isPending) return <Loader text="טוען משימות..." />;
  if (error) return <ErrorMessage message={error.message} />;

  const text = search.trim().toLowerCase();
  const shown = data.filter(
    (task) =>
      (patientFilter === '' || String(task.patient_id) === patientFilter) &&
      task.title.toLowerCase().includes(text)
  );

  return (
    <>
      <h1>לוח המשימות</h1>

      <nav className="tabs">
        <button className={`tab-button ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>
          לוח שבועי
        </button>
        <button className={`tab-button ${view === 'type' ? 'active' : ''}`} onClick={() => setView('type')}>
          רשימה לפי סוג
        </button>
      </nav>

      <div className="tab-toolbar">
        <input
          className="search-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="חיפוש משימה לפי שם"
        />
        <select value={patientFilter} onChange={(event) => setPatientFilter(event.target.value)}>
          <option value="">כל המטופלים</option>
          {patients.data?.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.patient_code} · {patient.full_name}
            </option>
          ))}
        </select>
        {view === 'type' && (
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                מיון לפי {option.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {view === 'week' ? <WeekBoard tasks={shown} /> : <TasksByType tasks={sortTasks(shown, sortBy)} />}
    </>
  );
}

export default BoardPage;
