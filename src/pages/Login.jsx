import GoogleLoginButton from "../services/auth/GoogleLoginButton";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold text-center">Ramadan Tracker</h1>
        <p className="text-sm text-slate-400 text-center">
          Masuk untuk mulai mencatat ibadah Ramadhan
        </p>

        <GoogleLoginButton />
      </div>
    </div>
  );
}
