import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../AuthContext';
import { useRequests } from '../useRequests';
import { getTaskStatus } from '../utils';
import type { ReplacementRequest } from '../types';
import ErrorMessage from './ErrorMessage';
import Loader from './Loader';
import TaskChip from './TaskChip';
import TaskModal from './TaskModal';

function MessagesPage() {
  const { token } = useAuth();
  const [selected, setSelected] = useState<ReplacementRequest | null>(null);

  const { data, isPending, error } = useRequests();

  if (!token) return <Navigate to="/login" />;
  if (isPending) return <Loader text="טוען הודעות..." />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <section className="messages">
      <h1>הודעות</h1>

      {data.length === 0 && <p className="messages-empty">אין הודעות חדשות.</p>}

      {data.map((request) => (
        <article key={request.request_id} className="message">
          <p className="message-text">
            <strong>{request.requester_name}</strong> לא יכול/ה להגיע ומבקש/ת מחליף/ה.
            מי יכול/ה להחליף במשימה אצל {request.task.patient_name}?
          </p>
          <TaskChip
            patientCode={request.task.patient_code}
            patientName={request.task.patient_name}
            title={request.task.title}
            time={format(new Date(request.task.starts_at), 'd.M HH:mm')}
            status={getTaskStatus(request.task)}
            isMine={false}
            isReplacement
            onButtonClick={() => setSelected(request)}
          />
        </article>
      ))}

      {selected && (
        <TaskModal
          task={selected.task}
          requestId={selected.request_id}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}

export default MessagesPage;
