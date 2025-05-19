"use client";

import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';

// Wrapper component with Suspense boundary
export default function ResetPasswordOTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}