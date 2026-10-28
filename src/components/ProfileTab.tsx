import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../AuthContext';
import { fetchMe, updateMe, type Me, type ProfileForm as ProfileValues } from '../api';
import ErrorMessage from './ErrorMessage';
import Loader from './Loader';

type ProfileFormProps = {
  me: Me;
  onDone: () => void;
};

// The edit form. It starts with the current details of the user.
function ProfileForm({ me, onDone }: ProfileFormProps) {
  const { token, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileValues>({
    defaultValues: { full_name: me.full_name, email: me.email, phone: me.phone },
  });

  const mutation = useMutation({
    mutationFn: (values: ProfileValues) => updateMe(token!, values),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      onDone();
    },
  });

  return (
    <form className="form-card" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
      <h3>עריכת פרופיל</h3>
      <label>
        שם מלא
        <input {...register('full_name', { required: 'צריך להזין שם מלא' })} />
        <ErrorMessage message={errors.full_name?.message} />
      </label>
      <label>
        אימייל
        <input
          type="email"
          {...register('email', {
            required: 'צריך להזין אימייל',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'האימייל לא תקין' },
          })}
        />
        <ErrorMessage message={errors.email?.message} />
      </label>
      <label>
        טלפון
        <input
          type="tel"
          {...register('phone', {
            required: 'צריך להזין טלפון',
            pattern: { value: /^[0-9\-+ ]{9,15}$/, message: 'מספר טלפון לא תקין' },
          })}
        />
        <ErrorMessage message={errors.phone?.message} />
      </label>

      <ErrorMessage message={mutation.error?.message} />

      <div className="form-buttons">
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'שומר...' : 'שמירה'}
        </button>
        <button type="button" className="secondary" onClick={onDone}>
          ביטול
        </button>
      </div>
    </form>
  );
}

function ProfileTab() {
  const { token } = useAuth();
  const [editing, setEditing] = useState(false);

  const me = useQuery({
    queryKey: ['me', token],
    queryFn: () => fetchMe(token!),
    enabled: token !== null,
  });

  if (me.isPending) return <Loader />;
  if (me.error) return <ErrorMessage message={me.error.message} />;

  if (editing) return <ProfileForm me={me.data} onDone={() => setEditing(false)} />;

  const details = [
    { label: 'שם', value: me.data.full_name },
    { label: 'אימייל', value: me.data.email },
    { label: 'טלפון', value: me.data.phone },
    { label: 'תפקיד', value: me.data.role === 'admin' ? 'מנהל' : 'מתנדב' },
    { label: 'מכסה חודשית', value: `${me.data.monthly_quota} משימות` },
    { label: 'החודש', value: `${me.data.this_month_count} משימות` },
    {
      label: 'מטופלים',
      value: me.data.patients.length > 0 ? me.data.patients.map((patient) => patient.full_name).join(', ') : 'אין',
    },
  ];

  return (
    <div className="profile-card">
      <dl className="task-details">
        {details.map((row) => (
          <div key={row.label} className="task-details-row">
            <dt>{row.label}:</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <button onClick={() => setEditing(true)}>עריכת פרופיל</button>
    </div>
  );
}

export default ProfileTab;
