import { FiAlertCircle } from 'react-icons/fi';

const ErrorMessage = ({ message, errors = [] }) => {
  if (!message) return null;
  return (
    <div className="error-box" role="alert">
      <FiAlertCircle className="error-box__icon" />
      <div className="error-box__content">
        <p className="error-box__message">{message}</p>
        {errors.length > 0 && (
          <ul className="error-box__list">
            {errors.map((e, i) => (
              <li key={i}>{e.message || e}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
