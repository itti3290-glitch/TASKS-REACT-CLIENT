import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { registerRequest, type NewAccount } from '../api';
import { useAuth } from '../AuthContext';
import ErrorMessage from './ErrorMessage';

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewAccount>({ defaultValues: { full_name: '', email: '', phone: '', password: '' } });

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate('/');
    },
  });

  return (
    <form className="form-card" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
      <h2>הרשמה</h2>

      <label>
        שם מלא
        <input
          {...register('full_name', {
            required: 'צריך להזין שם מלא',
            minLength: { value: 2, message: 'השם קצר מדי' },
          })}
        />
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
        סיסמה (לפחות 6 תווים)
        <input
          type="password"
          {...register('password', {
            required: 'צריך לבחור סיסמה',
            minLength: { value: 6, message: 'הסיסמה צריכה להיות לפחות 6 תווים' },
          })}
        />
        <ErrorMessage message={errors.password?.message} />
      </label>

      <ErrorMessage message={mutation.error?.message} />

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'נרשם...' : 'הרשמה'}
      </button>

      <p className="form-switch">
        כבר רשומים? <Link to="/login">כניסה</Link>
      </p>
    </form>
  );
}

export default RegisterPage;
