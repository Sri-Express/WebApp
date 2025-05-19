import ResetPasswordClient from './ResetPasswordClient';

// Async server component that receives route params
export default async function Page({ params }: { params: { token: string } }) {
  return <ResetPasswordClient token={params.token} />;
}