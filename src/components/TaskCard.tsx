import { categoryLabels, type Task } from '../types';
import { getTaskStatus, statusLabels } from '../utils';

type TaskCardProps = {
  task: Task;
};

function TaskCard({ task }: TaskCardProps) {
  const status = getTaskStatus(task);
  const date = new Date(task.starts_at);

  const details = [
    { label: 'מטופל', value: task.patient_name },
    { label: 'סוג המשימה', value: categoryLabels[task.category] },
    { label: 'תאריך', value: date.toLocaleDateString('he-IL') },
    { label: 'שעה', value: date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) },
    { label: 'משך', value: task.duration_minutes ? `${task.duration_minutes} דקות` : 'לא צוין' },
    { label: 'מקום', value: task.location ?? 'לא צוין' },
    { label: 'תיאור', value: task.description },
    { label: 'מתנדבים', value: `${task.signed_up_count} מתוך ${task.volunteers_needed}` },
    { label: 'נרשמו', value: task.volunteer_names.length > 0 ? task.volunteer_names.join(', ') : 'עדיין אף אחד' },
    { label: 'סטטוס', value: statusLabels[status] },
    { label: 'קוד משימה', value: task.code },
  ];

  return (
    <article className={`task-card status-${status}`}>
      <div className="task-card-top">
        <h3>{task.title}</h3>
        {task.is_mine && <span className="mine-badge">התנדבתי</span>}
      </div>

      <dl className="task-details">
        {details.map((row) => (
          <div key={row.label} className="task-details-row">
            <dt>{row.label}:</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export default TaskCard;
