import React, { useState } from "react";
import { User, Shield, Bell, Box, CreditCard, Users } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="min-h-screen bg-egg">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-48 bg-tea border-r border-green/20 p-6 min-h-screen sticky top-6">
          <nav className="space-y-2">
            <SidebarItem
              icon={User}
              label="General"
              active={activeTab === "general"}
              onClick={() => setActiveTab("general")}
            />
            <SidebarItem
              icon={Shield}
              label="Security"
              active={activeTab === "security"}
              onClick={() => setActiveTab("security")}
            />
            <SidebarItem
              icon={CreditCard}
              label="Billing"
              active={activeTab === "billing"}
              onClick={() => setActiveTab("billing")}
            />
            <SidebarItem
              icon={Bell}
              label="Notifications"
              active={activeTab === "notifications"}
              onClick={() => setActiveTab("notifications")}
            />
            <SidebarItem
              icon={Users}
              label="Privacy"
              active={activeTab === "privacy"}
              onClick={() => setActiveTab("privacy")}
            />
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 bg-egg">
          {/* General Tab */}
          {activeTab === "general" && (
            <section className="mb-12">
              <h1 className="font-display text-3xl font-bold text-green mb-2">
                Profile
              </h1>
              <p className="font-sans text-sm text-teal mb-8">
                Manage your personal information and preferences.
              </p>

              <div className="space-y-6">
                <SettingRow label="Full name" value="Hoosky" />
                <SettingRow
                  label="Email address"
                  value="h.dog@northeastern.edu"
                />
                
              </div>
            </section>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <section className="mb-12">
              <h1 className="font-display text-3xl font-bold text-green mb-2">
                Security
              </h1>
              <p className="font-sans text-sm text-teal mb-8">
                Update your password and security settings.
              </p>

              <div className="space-y-6">
                <SettingRow label="Password" value="••••••••" />
                <SettingRow label="Two-factor authentication" value="Enabled" />
                <SettingRow label="Login history" value="" />
              </div>
            </section>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <section className="mb-12">
              <h1 className="font-display text-3xl font-bold text-green mb-2">
                Billing
              </h1>
              <p className="font-sans text-sm text-teal mb-8">
                Manage your meal plan and payment methods.
              </p>

              <div className="space-y-6">
                <SettingRow label="Meal plan" value="Unlimited Plus" />
                <SettingRow label="Dining dollars" value="$250.00" />
                <SettingRow label="Payment method" value="Visa •••• 4242" />
              </div>
            </section>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <section className="mb-12">
              <h1 className="font-display text-3xl font-bold text-green mb-2">
                Notifications
              </h1>
              <p className="font-sans text-sm text-teal mb-8">
                Choose what notifications you receive.
              </p>

              <div className="space-y-6">
                <SettingRow label="Email notifications" value="Enabled" />
                <SettingRow label="Push notifications" value="Enabled" />
                <SettingRow label="Daily calorie summary" value="Enabled" />
                <SettingRow label="Dining hall updates" value="Disabled" />
              </div>
            </section>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <section className="mb-12">
              <h1 className="font-display text-3xl font-bold text-green mb-2">
                Privacy
              </h1>
              <p className="font-sans text-sm text-teal mb-8">
                Control your data and privacy settings.
              </p>

              <div className="space-y-6">
                <SettingRow label="Profile visibility" value="Friends only" />
                <SettingRow label="Show meal history" value="Private" />
                <SettingRow label="Data sharing" value="Disabled" />
                <SettingRow label="Delete account" value="" />
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function SettingRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-tea">
      <div className="flex-1">
        <div className="font-sans text-sm font-medium text-green">{label}</div>
        {value && (
          <div className="font-sans text-sm text-teal/70 mt-1">{value}</div>
        )}
      </div>
      <button className="text-blue hover:text-teal font-sans text-sm font-semibold transition-colors">
        Update
      </button>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-sans ${
        active ? "bg-blue text-white" : "text-green hover:bg-green/10"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
