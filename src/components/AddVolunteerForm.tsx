import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../AuthContext';
import { createVolunteer, type NewVolunteer } from '../api';
import ErrorMessage from './ErrorMessage';

type AddVolunteerFormProps = {
  onDone: () => void;
};

function AddVolunteerForm(props: AddVolunteerFormProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewVolunteer>({ defaultValues: { full_name: '', email: '', phone: '', password: '' } });

  const mutation = useMutation({
    mutationFn: (values: NewVolunteer) => createVolunteer(token!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      props.onDone();
    },
  });

  return (
    <form className="form-card inline-form" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
      <h3>מתנדב חדש</h3>
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
      <label>
        סיסמה ראשונית (לפחות 6 תווים)
        <input
          {...register('password', {
            required: 'צריך לבחור סיסמה',
            minLength: { value: 6, message: 'הסיסמה צריכה להיות לפחות 6 תווים' },
          })}
        />
        <ErrorMessage message={errors.password?.message} />
      </label>

      <ErrorMessage message={mutation.error?.message} />

      <div className="form-buttons">
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'שומר...' : 'הוספת מתנדב'}
        </button>
        <button type="button" className="secondary" onClick={props.onDone}>
          ביטול
        </button>
      </div>
    </form>
  );
}

export default AddVolunteerForm;
