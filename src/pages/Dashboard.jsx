import AdSlot from '../components/AdSlot';
import DashboardSummary from '../components/DashboardSummary';
import { useNaijaBase } from '../context/NaijaBaseContext';

export default function Dashboard() {
  const { currentUser } = useNaijaBase();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-neutral-text">
          Welcome, {currentUser?.username}
        </h1>
        <p className="text-sm text-gray-500">Here's your daily life at a glance.</p>
      </div>

      <div className="mb-6">
        <AdSlot width={728} height={90} className="mb-0" />
      </div>

      <DashboardSummary />
    </div>
  );
}
