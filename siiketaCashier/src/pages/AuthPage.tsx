
import AuthLayout from "@/components/AuthLayout";
import LoginForm from "@/components/LoginForm";
const AuthPage = () => {
  return (
    <AuthLayout 
      title={"Sign in to your account"}
      description={"Enter your credentials to access your account"}
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default AuthPage;