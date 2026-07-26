"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [userName, setUserName] = useState("");
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("speakiq_name");
    if (name) setUserName(name);
  }, []);

  const handleSave = () => {
    localStorage.setItem("speakiq_name", userName);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear your local application data? This resets onboarding but does NOT delete backend session videos.")) {
        localStorage.removeItem("speakiq_name");
        localStorage.removeItem("speakiq_onboarded");
        setUserName("");
        alert("Local data cleared. You will see the onboarding screen next time you visit the dashboard.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center animate-fade-in">
      <div className="max-w-2xl w-full">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your profile and application preferences.</p>
        </header>

        <div className="glass-panel p-8 rounded-2xl space-y-8">
          
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Your Name</label>
                <input 
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  placeholder="Enter your name"
                />
              </div>
              <button 
                 onClick={handleSave}
                 className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors"
              >
                 Save Changes
              </button>
              {savedMessage && <span className="ml-4 text-emerald-400 text-sm">Settings saved successfully!</span>}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800">
            <h2 className="text-xl font-semibold text-white mb-4 text-red-400">Danger Zone</h2>
            <p className="text-slate-400 text-sm mb-4">Resetting local data will clear your name and onboarding status.</p>
            <button 
               onClick={handleClearData}
               className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-medium transition-colors"
            >
               Reset Local Data
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
