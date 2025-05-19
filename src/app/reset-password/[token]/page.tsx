import ResetPasswordForm from './ResetPasswordForm';

// This is a server component that receives the route params
export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  // Pass the token to the client component
  return <ResetPasswordForm token={params.token} />;
}