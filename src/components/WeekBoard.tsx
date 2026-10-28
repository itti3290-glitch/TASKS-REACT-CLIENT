import { useState } from 'react';
import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isToday,
  startOfToday,
  startOfWeek,
} from 'date-fns';
import { he } from 'date-fns/locale';
import { getHebrewDate, getHolidayName } from '../HebrewDate';
import type { Task } from '../types';
import { getTaskStatus } from '../utils';
import TaskChip from './TaskChip';
import TaskModal from './TaskModal';

type WeekBoardProps = {
  tasks: Task[];
};

function WeekBoard({ tasks }: WeekBoardProps) {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const weekEnd = endOfWeek(weekStart);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const title = `${format(weekStart, 'd MMMM', { locale: he })} – ${format(weekEnd, 'd MMMM yyyy', { locale: he })}`;

  return (
    <section className="week-board">
      <div className="board-header">
        <button onClick={() => setWeekStart(addWeeks(weekStart, -1))}>השבוע הקודם</button>
        <h2>{title}</h2>
        <button onClick={() => setWeekStart(addWeeks(weekStart, 1))}>השבוע הבא</button>
      </div>

      <div className="week-grid">
        {days.map((day) => {
          const holiday = getHolidayName(day);
          const dayTasks = tasks.filter((task) => isSameDay(new Date(task.starts_at), day));
          return (
            <div
              key={day.toISOString()}
              className={`day-box ${isBefore(day, startOfToday()) ? 'past-day' : ''} ${isToday(day) ? 'today' : ''}`}
            >
              <div className="day-top">
                <span className="day-name">{format(day, 'EEEE', { locale: he })}</span>
                <span className="day-date">
                  {format(day, 'd.M')} · {getHebrewDate(day)}
                </span>
              </div>
              {holiday && <div className="day-holiday">{holiday}</div>}
              {dayTasks.map((task) => (
                <TaskChip
                  key={task.id}
                  patientCode={task.patient_code}
                  patientName={task.patient_name}
                  title={task.title}
                  time={format(new Date(task.starts_at), 'HH:mm')}
                  status={getTaskStatus(task)}
                  isMine={task.is_mine}
                  onButtonClick={() => setSelectedTask(task)}
                />
              ))}
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </section>
  );
}

export default WeekBoard;
