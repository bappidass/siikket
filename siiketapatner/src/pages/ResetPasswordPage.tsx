import ResetPasswordForm from "@/components/ResetPasswordForm";
import AuthLayout from "@/components/AuthLayout";

const ResetPasswordPage = () => {
  return (
    <AuthLayout 
      title="Reset Password"
      description="Enter your email to receive a password reset link"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
};

export default ResetPasswordPage;