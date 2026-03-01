import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, saveAuthSession } from "../../api/auth";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await login({
        email: form.email,
        password: form.password,
      });
      saveAuthSession(response);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lgteal via-gteal to-lgteal flex items-center justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-blue/20 bg-gteal/80 p-6 shadow-xl backdrop-blur-sm"
      >
        <h2 className="text-center text-blue mb-6">Log In</h2>

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
          className="w-full rounded-lg border border-blue/20 bg-lgteal px-3 py-2 text-blue placeholder-blue/60 mb-2 focus:outline-none focus:ring-2 focus:ring-teal"
          placeholder="Enter your password"
        />

        <div className="mb-4 text-right">
          <Link to="/forgot-password" className="text-sm">
            Forgot password?
          </Link>
        </div>

        {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          className="w-full rounded-lg border-2 border-teal bg-teal py-2 font-semibold text-gteal hover:bg-gteal hover:text-teal"
        >
          Log In
        </button>

        <p className="mt-4 text-center text-sm text-blue">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}