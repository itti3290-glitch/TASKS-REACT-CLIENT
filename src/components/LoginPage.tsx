import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { loginRequest } from '../api';
import { useAuth } from '../AuthContext';
import ErrorMessage from './ErrorMessage';

type LoginValues = {
  email: string;
  password: string;
};

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // register connects an input to the form; errors holds the validation message of each field.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ defaultValues: { email: '', password: '' } });

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate('/');
    },
  });

  return (
    <form className="form-card" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
      <h2>כניסה</h2>

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
        סיסמה
        <input type="password" {...register('password', { required: 'צריך להזין סיסמה' })} />
        <ErrorMessage message={errors.password?.message} />
      </label>

      <ErrorMessage message={mutation.error?.message} />

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'נכנס...' : 'כניסה'}
      </button>

      <p className="form-switch">
        עדיין לא רשומים? <Link to="/register">הרשמה</Link>
      </p>
    </form>
  );
}

export default LoginPage;
