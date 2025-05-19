// This is a workaround for the TypeScript error
import { ResetPasswordClient } from './ResetPasswordClient';

// Disable ESLint for this line only to fix build issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Page({ params }: any) {
  return <ResetPasswordClient token={params.token} />;
}