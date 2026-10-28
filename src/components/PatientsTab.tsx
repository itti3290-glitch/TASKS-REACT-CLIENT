import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { fetchPatients } from '../api';
import ErrorMessage from './ErrorMessage';
import Loader from './Loader';

function PatientsTab() {
  const { token } = useAuth();

  const patients = useQuery({
    queryKey: ['patients', token],
    queryFn: () => fetchPatients(token!),
    enabled: token !== null,
  });

  if (patients.isPending) return <Loader />;
  if (patients.error) return <ErrorMessage message={patients.error.message} />;
  if (patients.data.length === 0) return <p className="messages-empty">עדיין לא שובצת לאף מטופל.</p>;

  return (
    <div className="patient-cards">
      {patients.data.map((patient) => (
        <Link key={patient.id} to={`/patients/${patient.id}`} className="patient-card">
          <span className="code-patient">{patient.patient_code}</span>
          <strong>{patient.full_name}</strong>
          <span className="patient-card-address">{patient.address}</span>
        </Link>
      ))}
    </div>
  );
}

export default PatientsTab;
