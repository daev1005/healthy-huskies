import React from "react";
import { Link } from "react-router-dom";
import { enableGuestMode } from "../api/auth";

const featureCards = [
  {
    title: "Daily Menus",
    description: "See what's cooking at the Eatery, updated every day.",
  },
  {
    title: "Community Tips",
    description: "Share favorites and discover what others love.",
  },
  {
    title: "Weekly Goals",
    description: "Track your eating habits and stay on target.",
  },
];

export default function Welcome() {
  return (
    <div className="min-h-screen w-full px-6 py-8 lg:px-12 lg:py-10 bg-gradient-to-br from-lgteal via-gteal to-lgteal flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <div className="rounded-3xl border border-blue/20 bg-gteal/60 backdrop-blur-sm shadow-xl p-8 md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <p
              className="inline-flex items-center rounded-full bg-blue/20 px-4 py-2 text-sm font-semibold text-blue animate-fade-up"
              style={{ animationDelay: "0.05s" }}
            >
              Northeastern Dining Companion
            </p>

            <h1
              className="mt-6 text-5xl md:text-7xl font-bold leading-tight bg-gradient-to-r from-vgreen via-blue to-teal bg-clip-text text-transparent animate-fade-up"
              style={{ animationDelay: "0.15s" }}
            >
              Healthy Huskies
            </h1>

            <p
              className="mt-5 text-lg md:text-2xl text-blue/90 animate-fade-up"
              style={{ animationDelay: "0.25s" }}
            >
              Eat smarter at Northeastern. Know your menu, share your favorites,
              and stay well.
            </p>

            <div
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
              style={{ animationDelay: "0.35s" }}
            >
              <Link
                to="/login"
                className="w-full sm:w-auto rounded-full border-2 border-teal bg-teal px-8 py-3 text-lg font-semibold text-gteal transition-colors duration-300 hover:bg-gteal hover:text-teal"
              >
                Log in
              </Link>
              <Link
                to="/home"
                onClick={enableGuestMode}
                className="w-full sm:w-auto rounded-full border-2 border-blue bg-transparent px-8 py-3 text-lg font-semibold text-blue transition-colors duration-300 hover:bg-blue hover:text-gteal"
              >
                Continue as guest
              </Link>
            </div>
            <p
              className="mt-4 text-blue/90 animate-fade-up"
              style={{ animationDelay: "0.42s" }}
            >
              New to Healthy Huskies? <Link to="/register">Create an account</Link>
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            {featureCards.map((card, index) => (
              <div
                key={card.title}
                className="rounded-2xl border border-blue/20 bg-lgteal/80 p-6 shadow-md transition-transform duration-300 hover:-translate-y-1 animate-fade-up"
                style={{ animationDelay: `${0.45 + index * 0.12}s` }}
              >
                <h3 className="text-2xl font-semibold text-teal">{card.title}</h3>
                <p className="mt-2 text-blue/90">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
