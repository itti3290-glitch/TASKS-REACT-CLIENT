import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../types';
import { useAuth } from '../AuthContext';
import { acceptRequest, deleteTask, requestReplacement, signupToTask } from '../api';
import ErrorMessage from './ErrorMessage';
import TaskCard from './TaskCard';

type TaskModalProps = {
  task: Task;
  onClose: () => void;
  requestId?: number;
};

function TaskModal(props: TaskModalProps) {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // replace: taking over from someone who asked for a replacement
  // cancel:  I am signed up and ask the team for a replacement
  // signup:  a regular signup
  const mode = props.requestId ? 'replace' : props.task.is_mine ? 'cancel' : 'signup';
  const isAdmin = user?.role === 'admin' && !props.requestId;

  const action = useMutation({
    mutationFn: () => {
      if (mode === 'replace') return acceptRequest(token!, props.requestId!);
      if (mode === 'cancel') return requestReplacement(token!, props.task.id);
      return signupToTask(token!, props.task.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      props.onClose();
    },
  });

  const remove = useMutation({
    mutationFn: () => deleteTask(token!, props.task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      props.onClose();
    },
  });

  function handleDelete() {
    if (window.confirm(`למחוק את המשימה "${props.task.title}"?\nההרשמות אליה יימחקו, ואי אפשר לשחזר.`)) {
      remove.mutate();
    }
  }

  return (
    <div className="modal-overlay" onClick={props.onClose}>
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>
        <TaskCard task={props.task} />

        <ErrorMessage message={action.error?.message ?? remove.error?.message} />

        <div className="modal-actions">
          {mode === 'cancel' && props.task.replacement_requested ? (
            <span className="modal-note">בקשת ההחלפה נשלחה לצוות. עד שמישהו יחליף אותך, המשימה עדיין שלך.</span>
          ) : (
            <button
              className={`modal-button ${mode === 'cancel' ? 'danger' : 'primary'}`}
              onClick={() => action.mutate()}
              disabled={action.isPending}
            >
              {action.isPending
                ? 'שולח...'
                : mode === 'cancel'
                  ? 'שליחת הודעת ביטול לצוות'
                  : 'אישור התנדבות'}
            </button>
          )}
          {isAdmin && (
            <>
              <button className="modal-button" onClick={() => navigate(`/tasks/${props.task.id}/edit`)}>
                עריכה
              </button>
              <button className="modal-button danger" onClick={handleDelete} disabled={remove.isPending}>
                {remove.isPending ? 'מוחק...' : 'מחיקה'}
              </button>
            </>
          )}
          <button className="modal-button" onClick={props.onClose}>
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;
