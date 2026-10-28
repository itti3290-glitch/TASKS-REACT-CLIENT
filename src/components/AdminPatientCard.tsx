import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { addToTeam, deletePatient, removeFromTeam, type Volunteer } from '../api';
import type { Patient } from '../types';
import ErrorMessage from './ErrorMessage';

type AdminPatientCardProps = {
  patient: Patient;
  volunteers: Volunteer[];
};

// One patient in the admin page: details, the team, and adding or removing volunteers.
function AdminPatientCard(props: AdminPatientCardProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [chosenId, setChosenId] = useState('');

  const team = props.patient.volunteers ?? [];
  const notInTeam = props.volunteers.filter((v) => !team.some((member) => member.id === v.id));

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['patients'] });
    queryClient.invalidateQueries({ queryKey: ['volunteers'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }

  const add = useMutation({
    mutationFn: () => addToTeam(token!, props.patient.id, Number(chosenId)),
    onSuccess: () => {
      setChosenId('');
      refresh();
    },
  });

  const remove = useMutation({
    mutationFn: (userId: number) => removeFromTeam(token!, props.patient.id, userId),
    onSuccess: refresh,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePatient(token!, props.patient.id),
    onSuccess: () => {
      refresh();
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  function handleDelete() {
    const sure = window.confirm(
      `למחוק את ${props.patient.full_name}?\nכל המשימות של המטופל וההרשמות אליהן יימחקו, ואי אפשר לשחזר.`
    );
    if (sure) deleteMutation.mutate();
  }

  return (
    <article className="admin-card">
      <div className="admin-card-top">
        <div>
          <span className="code-patient">{props.patient.patient_code}</span>
          <h3>{props.patient.full_name}</h3>
          <p className="admin-card-sub">
            {props.patient.address} · {props.patient.contact_phone}
          </p>
        </div>
        <Link to={`/patients/${props.patient.id}`} className="back-link">
          לעמוד המטופל ←
        </Link>
      </div>

      <p className="admin-card-label">צוות ({team.length})</p>
      <div className="team-list">
        {team.length === 0 && <span className="messages-empty">אין עדיין מתנדבים בצוות.</span>}
        {team.map((member) => (
          <span key={member.id} className="team-member">
            {member.full_name}
            <button
              type="button"
              title="הסרה מהצוות"
              onClick={() => remove.mutate(member.id)}
              disabled={remove.isPending}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="team-add">
        <select value={chosenId} onChange={(event) => setChosenId(event.target.value)}>
          <option value="">בחרו מתנדב להוספה</option>
          {notInTeam.map((v) => (
            <option key={v.id} value={v.id}>
              {v.full_name} · {v.email}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => add.mutate()} disabled={!chosenId || add.isPending}>
          הוספה לצוות
        </button>
      </div>

      <ErrorMessage message={(add.error ?? remove.error ?? deleteMutation.error)?.message} />

      <button type="button" className="delete-button" onClick={handleDelete} disabled={deleteMutation.isPending}>
        {deleteMutation.isPending ? 'מוחק...' : 'מחיקת מטופל'}
      </button>
    </article>
  );
}

export default AdminPatientCard;
