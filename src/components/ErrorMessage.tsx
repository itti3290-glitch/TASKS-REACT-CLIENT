type ErrorMessageProps = {
  message?: string | null;
};

// One error message for the whole site: server errors and form-field errors.
// With no message it shows nothing, so it can always be placed in the page.
function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  return (
    <span className="form-error" role="alert">
      {message}
    </span>
  );
}

export default ErrorMessage;
