import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../AuthContext';
import { createPatient, type NewPatient } from '../api';
import ErrorMessage from './ErrorMessage';

type AddPatientFormProps = {
  onDone: () => void;
};

function AddPatientForm(props: AddPatientFormProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPatient>({ defaultValues: { full_name: '', address: '', contact_phone: '', notes: '' } });

  const mutation = useMutation({
    mutationFn: (values: NewPatient) => createPatient(token!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      props.onDone();
    },
  });

  return (
    <form className="form-card inline-form" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
      <h3>מטופל חדש</h3>
      <label>
        שם מלא
        <input {...register('full_name', { required: 'צריך להזין שם מלא' })} />
        <ErrorMessage message={errors.full_name?.message} />
      </label>
      <label>
        כתובת
        <input {...register('address', { required: 'צריך להזין כתובת' })} />
        <ErrorMessage message={errors.address?.message} />
      </label>
      <label>
        טלפון איש קשר
        <input
          type="tel"
          {...register('contact_phone', {
            required: 'צריך להזין טלפון',
            pattern: { value: /^[0-9\-+ ]{9,15}$/, message: 'מספר טלפון לא תקין' },
          })}
        />
        <ErrorMessage message={errors.contact_phone?.message} />
      </label>
      <label>
        הערות (לא חובה)
        <textarea rows={2} {...register('notes')} />
      </label>

      <ErrorMessage message={mutation.error?.message} />

      <div className="form-buttons">
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'שומר...' : 'הוספת מטופל'}
        </button>
        <button type="button" className="secondary" onClick={props.onDone}>
          ביטול
        </button>
      </div>
    </form>
  );
}

export default AddPatientForm;
