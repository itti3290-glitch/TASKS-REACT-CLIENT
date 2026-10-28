import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { fetchPatients, fetchPatientTasks } from '../api';
import ErrorMessage from './ErrorMessage';
import Loader from './Loader';
import TaskColumns from './TaskColumns';

// The patient's own page: details, and ALL of the patient's tasks (not only mine).
function PatientPage() {
  const { token } = useAuth();
  const { patientId } = useParams();

  const patients = useQuery({
    queryKey: ['patients', token],
    queryFn: () => fetchPatients(token!),
    enabled: token !== null,
  });

  const tasks = useQuery({
    queryKey: ['tasks', token, 'patient', patientId],
    queryFn: () => fetchPatientTasks(token!, patientId!),
    enabled: token !== null,
  });

  if (!token) return <Navigate to="/login" />;
  if (patients.isPending) return <Loader />;

  const patient = patients.data?.find((p) => String(p.id) === patientId);
  if (!patient) return <ErrorMessage message="המטופל לא נמצא" />;

  const now = new Date();
  const upcoming = (tasks.data ?? []).filter((task) => new Date(task.starts_at) >= now);
  const past = (tasks.data ?? []).filter((task) => new Date(task.starts_at) < now).reverse();

  const details = [
    { label: 'קוד מטופל', value: patient.patient_code },
    { label: 'כתובת', value: patient.address },
    { label: 'טלפון איש קשר', value: patient.contact_phone },
    { label: 'הערות', value: patient.notes ?? 'אין' },
  ];

  return (
    <section className="patient-page">
      <Link to="/me/patients" className="back-link">
        → חזרה למטופלים שלי
      </Link>
      <h1>{patient.full_name}</h1>

      <div className="profile-card">
        <dl className="task-details">
          {details.map((row) => (
            <div key={row.label} className="task-details-row">
              <dt>{row.label}:</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <h2 className="section-title">כל המשימות של {patient.full_name}</h2>
      {tasks.isPending && <Loader text="טוען משימות..." />}
      <ErrorMessage message={tasks.error?.message} />
      {tasks.data && (
        <TaskColumns upcoming={upcoming} past={past} upcomingTitle="משימות עתידיות" pastTitle="היסטוריית משימות" showVolunteers />
      )}
    </section>
  );
}

export default PatientPage;
