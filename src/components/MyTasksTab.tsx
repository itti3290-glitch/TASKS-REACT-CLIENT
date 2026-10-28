import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuth } from '../AuthContext';
import { fetchMyTasks, fetchPatients } from '../api';
import { getTaskStatus, sortOptions, sortTasks, type SortOption } from '../utils';
import type { Task } from '../types';
import ErrorMessage from './ErrorMessage';
import Loader from './Loader';
import TaskChip from './TaskChip';
import TaskModal from './TaskModal';

type ShowOption = 'all' | 'done' | 'upcoming';

const showOptions: { value: ShowOption; label: string }[] = [
  { value: 'all', label: 'כל המשימות' },
  { value: 'done', label: 'משימות שביצעתי' },
  { value: 'upcoming', label: 'משימות עתידיות' },
];

function MyTasksTab() {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [show, setShow] = useState<ShowOption>('all');
  const [patientFilter, setPatientFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const tasks = useQuery({
    queryKey: ['tasks', token, 'mine'],
    queryFn: () => fetchMyTasks(token!),
    enabled: token !== null,
  });

  const patients = useQuery({
    queryKey: ['patients', token],
    queryFn: () => fetchPatients(token!),
    enabled: token !== null,
  });

  if (tasks.isPending) return <Loader text="טוען משימות..." />;
  if (tasks.error) return <ErrorMessage message={tasks.error.message} />;

  const now = new Date();
  const text = search.trim().toLowerCase();
  let visible = tasks.data.filter((task) => task.title.toLowerCase().includes(text));
  if (show === 'done') visible = visible.filter((task) => new Date(task.starts_at) < now);
  if (show === 'upcoming') visible = visible.filter((task) => new Date(task.starts_at) >= now);
  if (patientFilter) visible = visible.filter((task) => String(task.patient_id) === patientFilter);

  visible = sortTasks(visible, sortBy);
  // Done tasks: the most recent one first when sorting by date.
  if (show === 'done' && sortBy === 'date') visible.reverse();

  return (
    <>
      <div className="tab-toolbar">
        <input
          className="search-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="חיפוש משימה לפי שם"
        />

        <label>
          הצג
          <select value={show} onChange={(event) => setShow(event.target.value as ShowOption)}>
            {showOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          מטופל
          <select value={patientFilter} onChange={(event) => setPatientFilter(event.target.value)}>
            <option value="">כל המטופלים</option>
            {patients.data?.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.patient_code} · {patient.full_name}
              </option>
            ))}
          </select>
        </label>

        <label>
          מיון לפי
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="list-count">{visible.length} משימות</p>

      <div className="task-list">
        {visible.length === 0 && <p className="messages-empty">אין משימות להצגה.</p>}
        {visible.map((task) => (
          <TaskChip
            key={task.id}
            patientCode={task.patient_code}
            patientName={task.patient_name}
            title={task.title}
            time={format(new Date(task.starts_at), 'd.M.yyyy HH:mm')}
            status={getTaskStatus(task)}
            isMine={task.is_mine}
            onButtonClick={() => setSelectedTask(task)}
          />
        ))}
      </div>

      {selectedTask && <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </>
  );
}

export default MyTasksTab;
