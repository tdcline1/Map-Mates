import Form from '../components/Form';

function Login({ onLoginSuccess, onClose, onRegisterClick }) {
  const handleSuccess = (username) => {
    onLoginSuccess(username);
  };

  const handleClose = (nextOverlay) => {
    if (nextOverlay === 'register') {
      onRegisterClick();
    } else {
      onClose();
    }
  };
  return (
    <Form
      route="/api/token/"
      method="login"
      onSuccess={handleSuccess}
      onClose={handleClose}
    />
  );
}

export default Login;
