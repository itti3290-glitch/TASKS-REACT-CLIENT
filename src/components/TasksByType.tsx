import { useState } from 'react';
import { format } from 'date-fns';
import { categoryLabels, type Task, type TaskCategory } from '../types';
import { getTaskStatus } from '../utils';
import TaskChip from './TaskChip';
import TaskModal from './TaskModal';

type TasksByTypeProps = {
  tasks: Task[];
};

// The tasks as a list, grouped by task type (doctor, care, visit...).
// The order inside each group is the order of the list it receives, so sorting happens before.
function TasksByType({ tasks }: TasksByTypeProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const categories = Object.keys(categoryLabels) as TaskCategory[];

  if (tasks.length === 0) return <p className="messages-empty">אין משימות להצגה.</p>;

  return (
    <>
      {categories.map((category) => {
        const group = tasks.filter((task) => task.category === category);
        if (group.length === 0) return null;
        return (
          <section key={category}>
            <h2 className="section-title">
              {categoryLabels[category]} ({group.length})
            </h2>
            <div className="task-list">
              {group.map((task) => (
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
          </section>
        );
      })}

      {selectedTask && <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </>
  );
}

export default TasksByType;
