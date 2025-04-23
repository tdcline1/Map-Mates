import Form from '../components/Form';

function Login({ setIsAuthenticated }) {
  return (
    <Form
      setIsAuthenticated={setIsAuthenticated}
      route="/api/token/"
      method="login"
    />
  );
}

export default Login;
