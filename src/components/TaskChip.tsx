import { statusLabels, type TaskStatus } from '../utils';

type TaskChipProps = {
  patientCode: string;
  patientName: string;
  title: string;
  time: string;
  status: TaskStatus;
  isMine: boolean;
  isReplacement?: boolean;
  volunteers?: string[];
  onButtonClick: () => void;
};

function TaskChip(props: TaskChipProps) {
  let buttonText = props.isMine ? 'בטל התנדבות' : 'התנדב';
  let isDisabled = props.status === 'past' || (props.status === 'full' && !props.isMine);

  // A replacement takes the requester's place, so a full task is still open to it.
  if (props.isReplacement) {
    buttonText = 'אישור התנדבות';
    isDisabled = props.status === 'past';
  }

  return (
    <div className={`task-chip status-${props.status}`}>
      <span className="code-patient">{props.patientCode} · {props.patientName}</span>
      <span className="task-chip-title">{props.title}</span>
      <span className="task-chip-time">שעה: {props.time}</span>
      <span className="task-chip-status">סטטוס: {statusLabels[props.status]}</span>
      {props.volunteers && (
        <span className="task-chip-volunteers">
          מתנדבים: {props.volunteers.length > 0 ? props.volunteers.join(', ') : 'עדיין אף אחד'}
        </span>
      )}

      <button
        className="chip-button"
        disabled={isDisabled}
        onClick={props.onButtonClick}
      >
        {buttonText}
      </button>
    </div>
  );
}

export default TaskChip;
