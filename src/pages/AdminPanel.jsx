import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNaijaBase } from "../context/NaijaBaseContext";

export default function AdminPanel() {
  const { currentUser } = useNaijaBase();
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(null); // Start with null
  const [error, setError] = useState(null);

  const ADMIN_EMAIL = "dapodevv@gmail.com";

  useEffect(() => {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        // Try Edge Function
        let count = 0;
        try {
          const res = await fetch(
            import.meta.env.VITE_SUPABASE_URL + "/functions/v1/get-total-users",
            {
              headers: {
                Authorization:
                  "Bearer " + import.meta.env.VITE_SUPABASE_ANON_KEY,
              },
            },
          );
          const data = await res.json();
          if (data.total_users !== undefined) {
            count = data.total_users;
          }
        } catch (e) {
          // Fallback to local count
          const { count: localCount } = await supabase
            .from("user_data")
            .select("*", { count: "exact", head: true });
          count = localCount || 0;
        }

        setTotalUsers(count);
      } catch (err) {
        console.error(err);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser]);

  // Security Check
  if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
    return (
      <div className="p-10 text-center text-red-600 bg-white min-h-screen">
        ⛔ You do not have permission to view the Admin Panel.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500 bg-white min-h-screen flex items-center justify-center">
        <div className="space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>Loading platform intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-500 bg-white min-h-screen">
        <p className="text-lg font-bold">Oops!</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          TrackCash Admin
        </h1>

        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-1">
            Total Registered Users
          </h2>
          {/* 🛡️ SAFE NULL CHECK HERE */}
          <p className="text-4xl font-bold text-gray-900">
            {totalUsers !== null ? totalUsers.toLocaleString() : "0"}
          </p>
        </div>

        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
          <p className="font-semibold">🟢 System Status: Healthy</p>
        </div>
      </div>
    </div>
  );
}
