import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/auth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = searchParams.get("token");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Missing reset token. Request a new password reset link.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await resetPassword({
        token,
        password: form.password,
      });
      setMessage(response?.message || "Password has been reset successfully.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message || "Could not reset password. Try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lgteal via-gteal to-lgteal flex items-center justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-blue/20 bg-gteal/80 p-6 shadow-xl backdrop-blur-sm"
      >
        <h2 className="text-center text-blue mb-4">Reset Password</h2>

        <label htmlFor="password" className="block text-sm text-blue mb-1">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={form.password}
          onChange={handleChange}
          className="w-full rounded-lg border border-blue/20 bg-lgteal px-3 py-2 text-blue placeholder-blue/60 mb-4 focus:outline-none focus:ring-2 focus:ring-teal"
          placeholder="Enter a new password"
        />

        <label
          htmlFor="confirmPassword"
          className="block text-sm text-blue mb-1"
        >
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full rounded-lg border border-blue/20 bg-lgteal px-3 py-2 text-blue placeholder-blue/60 mb-3 focus:outline-none focus:ring-2 focus:ring-teal"
          placeholder="Re-enter your new password"
        />

        {message ? <p className="mb-3 text-sm text-vgreen">{message}</p> : null}
        {error ? <p className="mb-3 text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          className="w-full rounded-lg border-2 border-teal bg-teal py-2 font-semibold text-gteal hover:bg-gteal hover:text-teal"
        >
          Reset Password
        </button>

        <p className="mt-4 text-center text-sm text-blue">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
