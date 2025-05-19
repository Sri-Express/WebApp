// This is a workaround for the TypeScript error
import { ResetPasswordClient } from './ResetPasswordClient';

// Using any to bypass the TypeScript error with PageProps
export default function Page({ params }: any) {
  return <ResetPasswordClient token={params.token} />;
}