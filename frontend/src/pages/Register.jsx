import Form from '../components/Form';

function Register({ onLoginSuccess, onClose, onLoginClick }) {
  const handleSuccess = (username) => {
    onLoginSuccess(username);
  };

  const handleClose = (nextOverlay) => {
    if (nextOverlay === 'login') {
      onLoginClick();
    } else {
      onClose();
    }
  };
  return (
    <Form
      route="/api/user/register/"
      method="register"
      onSuccess={handleSuccess}
      onClose={handleClose}
    />
  );
}

export default Register;
