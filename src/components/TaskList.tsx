import TaskCard from './TaskCard';
import type { Task } from '../types';

type TaskListProps = {
  tasks: Task[];
};

function TaskList({ tasks }: TaskListProps) {
  return (
    <section>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </section>
  );
}

export default TaskList;