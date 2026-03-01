import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, saveAuthSession } from "../../api/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const normalizedEmail = form.email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await register({
        name: form.fullName,
        email: normalizedEmail,
        password: form.password,
      });
      saveAuthSession(response);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Could not create account. Try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lgteal via-gteal to-lgteal flex items-center justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-blue/20 bg-gteal/80 p-6 shadow-xl backdrop-blur-sm"
      >
        <h2 className="text-center text-blue mb-6">Create Account</h2>

        <label htmlFor="fullName" className="block text-sm text-blue mb-1">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          value={form.fullName}
          onChange={handleChange}
          className="w-full rounded-lg border border-blue/20 bg-lgteal px-3 py-2 text-blue placeholder-blue/60 mb-4 focus:outline-none focus:ring-2 focus:ring-teal"
          placeholder="Jane Doe"
        />

        <label htmlFor="email" className="block text-sm text-blue mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full rounded-lg border border-blue/20 bg-lgteal px-3 py-2 text-blue placeholder-blue/60 mb-4 focus:outline-none focus:ring-2 focus:ring-teal"
          placeholder="you@northeastern.edu"
        />

        <label htmlFor="password" className="block text-sm text-blue mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={form.password}
          onChange={handleChange}
          className="w-full rounded-lg border border-blue/20 bg-lgteal px-3 py-2 text-blue placeholder-blue/60 mb-4 focus:outline-none focus:ring-2 focus:ring-teal"
          placeholder="Create a password"
        />

        <label
          htmlFor="confirmPassword"
          className="block text-sm text-blue mb-1"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full rounded-lg border border-blue/20 bg-lgteal px-3 py-2 text-blue placeholder-blue/60 mb-2 focus:outline-none focus:ring-2 focus:ring-teal"
          placeholder="Re-enter your password"
        />

        {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          className="w-full rounded-lg border-2 border-teal bg-teal py-2 font-semibold text-gteal hover:bg-gteal hover:text-teal"
        >
          Sign Up
        </button>

        <p className="mt-4 text-center text-sm text-blue">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}