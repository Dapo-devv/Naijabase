import React from "react";
import AdSlot from "../components/AdSlot";
import DashboardSummary from "../components/DashboardSummary";
import { useNaijaBase } from "../context/NaijaBaseContext";

export default function Dashboard() {
  const { currentUser } = useNaijaBase();

  return (
    <div className="min-h-screen bg-neutral-bg dark:bg-gray-900 py-6 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-neutral-text dark:text-white">
            Welcome, {currentUser?.name || "User"} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Here's your daily life at a glance.
          </p>
        </div>

        {/* Ad Slot */}
        <div className="mb-6">
          <AdSlot width={728} height={90} className="mb-0" />
        </div>

        {/* Summary Cards */}
        <DashboardSummary />
      </div>
    </div>
  );
}
