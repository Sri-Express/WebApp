// This is a workaround for the TypeScript error
import { ResetPasswordClient } from './ResetPasswordClient';

export default function Page({ params }: any) {
  return <ResetPasswordClient token={params.token} />;
}