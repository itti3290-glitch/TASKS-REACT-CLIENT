import { useState } from 'react';
import { format } from 'date-fns';
import { getTaskStatus } from '../utils';
import type { Task } from '../types';
import TaskChip from './TaskChip';
import TaskModal from './TaskModal';

type TaskColumnsProps = {
  upcoming: Task[];
  past: Task[];
  upcomingTitle: string;
  pastTitle: string;
  showVolunteers?: boolean;
};

// Two columns of task chips (upcoming and past). Clicking a chip's button opens the details.
function TaskColumns(props: TaskColumnsProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  function renderChip(task: Task) {
    return (
      <TaskChip
        key={task.id}
        patientCode={task.patient_code}
        patientName={task.patient_name}
        title={task.title}
        time={format(new Date(task.starts_at), 'd.M.yyyy HH:mm')}
        status={getTaskStatus(task)}
        isMine={task.is_mine}
        volunteers={props.showVolunteers ? task.volunteer_names : undefined}
        onButtonClick={() => setSelectedTask(task)}
      />
    );
  }

  return (
    <>
      <div className="task-columns">
        <div>
          <h3>
            {props.upcomingTitle} ({props.upcoming.length})
          </h3>
          {props.upcoming.length === 0 && <p className="messages-empty">אין משימות.</p>}
          {props.upcoming.map(renderChip)}
        </div>
        <div>
          <h3>
            {props.pastTitle} ({props.past.length})
          </h3>
          {props.past.length === 0 && <p className="messages-empty">אין משימות.</p>}
          {props.past.map(renderChip)}
        </div>
      </div>

      {selectedTask && <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </>
  );
}

export default TaskColumns;
