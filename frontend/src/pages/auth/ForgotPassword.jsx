import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setResetUrl("");

    try {
      const response = await requestPasswordReset({ email });
      setMessage(response?.message || "If that email exists, reset instructions were sent.");
      if (response?.resetUrl) {
        setResetUrl(response.resetUrl);
      }
      setEmail("");
    } catch (err) {
      setError(err.message || "Unable to send reset email right now. Try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lgteal via-gteal to-lgteal flex items-center justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-blue/20 bg-gteal/80 p-6 shadow-xl backdrop-blur-sm"
      >
        <h2 className="text-center text-blue mb-3">Forgot Password</h2>
        <p className="text-sm text-blue/90 mb-5 text-center">
          Enter your account email and we will send reset instructions.
        </p>

        <label htmlFor="email" className="block text-sm text-blue mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-blue/20 bg-lgteal px-3 py-2 text-blue placeholder-blue/60 mb-3 focus:outline-none focus:ring-2 focus:ring-teal"
          placeholder="you@northeastern.edu"
        />

        {message ? <p className="mb-3 text-sm text-vgreen">{message}</p> : null}
        {error ? <p className="mb-3 text-sm text-red-400">{error}</p> : null}
        {resetUrl ? (
          <p className="mb-3 text-sm text-blue break-all">
            Dev reset link:{" "}
            <a href={resetUrl} className="underline">
              {resetUrl}
            </a>
          </p>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-lg border-2 border-teal bg-teal py-2 font-semibold text-gteal hover:bg-gteal hover:text-teal"
        >
          Send Reset Link
        </button>

        <p className="mt-4 text-center text-sm text-blue">
          Remembered it? <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
