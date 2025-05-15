import Form from '../components/Form';

function Login({ onClose, onRegisterClick }) {
  const handleClose = (nextOverlay) => {
    if (nextOverlay === 'register') {
      onRegisterClick();
    } else {
      onClose();
    }
  };
  return <Form route="/api/token/" method="login" onClose={handleClose} />;
}

export default Login;
