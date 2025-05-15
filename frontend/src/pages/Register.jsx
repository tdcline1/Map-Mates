import Form from '../components/Form';

function Register({ onClose, onLoginClick }) {
  const handleClose = (nextOverlay) => {
    if (nextOverlay === 'login') {
      onLoginClick();
    } else {
      onClose();
    }
  };
  return (
    <Form route="/api/user/register/" method="register" onClose={handleClose} />
  );
}

export default Register;
