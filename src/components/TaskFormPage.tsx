import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { createTask, fetchPatients, fetchTask, updateTask } from '../api';
import { categoryLabels, type Patient, type Task, type TaskCategory } from '../types';
import ErrorMessage from './ErrorMessage';
import Loader from './Loader';
import PatientPicker from './PatientPicker';

type TaskFormValues = {
  title: string;
  patient_id: string;
  category: TaskCategory;
  starts_at: string;
  duration_minutes: string;
  volunteers_needed: string;
  location: string;
  description: string;
};

type TaskFormProps = {
  patients: Patient[];
  task?: Task; // given when editing; missing when adding a new task
};

// The form itself. The same form adds a new task and edits an existing one.
function TaskForm({ patients, task }: TaskFormProps) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = task !== undefined;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    defaultValues: {
      title: task?.title ?? '',
      patient_id: task ? String(task.patient_id) : '',
      category: task?.category ?? 'visit',
      starts_at: task ? format(new Date(task.starts_at), "yyyy-MM-dd'T'HH:mm") : '',
      duration_minutes: task?.duration_minutes ? String(task.duration_minutes) : '',
      volunteers_needed: task ? String(task.volunteers_needed) : '1',
      location: task?.location ?? '',
      description: task?.description ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: TaskFormValues) => {
      const body = {
        title: values.title,
        category: values.category,
        starts_at: new Date(values.starts_at).toISOString(),
        duration_minutes: values.duration_minutes ? Number(values.duration_minutes) : null,
        volunteers_needed: Number(values.volunteers_needed),
        location: values.location,
        description: values.description,
        patient_id: Number(values.patient_id),
      };
      return isEditing ? updateTask(token!, task.id, body) : createTask(token!, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      navigate('/');
    },
  });

  return (
    <form className="form-card" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
      <h2>{isEditing ? 'עריכת משימה' : 'משימה חדשה'}</h2>

      <label>
        כותרת
        <input
          {...register('title', {
            required: 'צריך להזין כותרת',
            maxLength: { value: 40, message: 'עד 40 תווים' },
          })}
        />
        <ErrorMessage message={errors.title?.message} />
      </label>

      <label>
        מטופל
        <Controller
          name="patient_id"
          control={control}
          rules={{ required: 'צריך לבחור מטופל מהרשימה' }}
          render={({ field }) => (
            <PatientPicker patients={patients} initialId={field.value} onSelect={field.onChange} />
          )}
        />
        <ErrorMessage message={errors.patient_id?.message} />
      </label>

      <label>
        סוג המשימה
        <select {...register('category')}>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label>
        תאריך ושעה
        <input
          type="datetime-local"
          {...register('starts_at', {
            required: 'צריך לבחור תאריך ושעה',
            validate: (value) => isEditing || new Date(value) > new Date() || 'אי אפשר להוסיף משימה בתאריך שעבר',
          })}
        />
        <ErrorMessage message={errors.starts_at?.message} />
      </label>

      <label>
        משך בדקות (לא חובה)
        <input
          type="number"
          {...register('duration_minutes', { min: { value: 1, message: 'המשך צריך להיות לפחות דקה' } })}
        />
        <ErrorMessage message={errors.duration_minutes?.message} />
      </label>

      <label>
        כמה מתנדבים צריך
        <input
          type="number"
          {...register('volunteers_needed', {
            required: 'צריך להזין מספר מתנדבים',
            min: { value: 1, message: 'לפחות מתנדב אחד' },
            max: { value: 5, message: 'עד 5 מתנדבים' },
          })}
        />
        <ErrorMessage message={errors.volunteers_needed?.message} />
      </label>

      <label>
        מקום (לא חובה)
        <input {...register('location')} />
      </label>

      <label>
        תיאור
        <textarea rows={3} {...register('description', { required: 'צריך להזין תיאור' })} />
        <ErrorMessage message={errors.description?.message} />
      </label>

      <ErrorMessage message={mutation.error?.message} />

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'שומר...' : isEditing ? 'שמירת שינויים' : 'הוספת משימה'}
      </button>
    </form>
  );
}

// The page: checks who is allowed, loads what the form needs, then shows the form.
// Route /tasks/new adds a task; route /tasks/:taskId/edit edits one.
function TaskFormPage() {
  const { token, user } = useAuth();
  const { taskId } = useParams();

  const patients = useQuery({
    queryKey: ['patients', token],
    queryFn: () => fetchPatients(token!),
    enabled: token !== null,
  });

  const task = useQuery({
    queryKey: ['tasks', token, 'one', taskId],
    queryFn: () => fetchTask(token!, taskId!),
    enabled: token !== null && taskId !== undefined,
  });

  if (!token) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/" />;
  if (patients.isPending || (taskId !== undefined && task.isPending)) return <Loader />;
  if (patients.error) return <ErrorMessage message={patients.error.message} />;
  if (task.error) return <ErrorMessage message={task.error.message} />;

  return <TaskForm patients={patients.data} task={taskId ? task.data : undefined} />;
}

export default TaskFormPage;
