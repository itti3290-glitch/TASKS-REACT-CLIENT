import { useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../AuthContext';
import { useRequests } from '../useRequests';
import { getTaskStatus } from '../utils';
import type { ReplacementRequest } from '../types';
import TaskChip from './TaskChip';
import TaskModal from './TaskModal';

function readDismissed(key: string): number[] {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : [];
}

function RequestsPopup() {
  const { user } = useAuth();
  const requests = useRequests();
  const storageKey = `dismissed-requests-${user?.id}`;
  const [dismissed, setDismissed] = useState(() => readDismissed(storageKey));
  const [selected, setSelected] = useState<ReplacementRequest | null>(null);

  if (!user) return null;

  if (selected) {
    return (
      <TaskModal
        task={selected.task}
        requestId={selected.request_id}
        onClose={() => setSelected(null)}
      />
    );
  }

  const fresh = (requests.data ?? []).filter((request) => !dismissed.includes(request.request_id));
  if (fresh.length === 0) return null;

  function close() {
    const all = [...dismissed, ...fresh.map((request) => request.request_id)];
    localStorage.setItem(storageKey, JSON.stringify(all));
    setDismissed(all);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="popup-title">מחפשים מחליף/ה</h2>

        {fresh.map((request) => (
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

        <p className="popup-hint">אפשר להחליף גם אחר כך, מדף ההודעות.</p>
        <div className="modal-actions">
          <button className="modal-button" onClick={close}>
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}

export default RequestsPopup;
