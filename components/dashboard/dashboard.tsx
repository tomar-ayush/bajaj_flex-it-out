import { Leaderboard } from "./leaderboard";
import LiveTracking from "./live-tracking";
import { Sidebar } from "./sidebar";
import { UserOverview } from "./user-overview";

const MainDashboard = () => {
  return (
    <div className="block sm:flex h-screen bg-background">
      <div className="w-full sm:w-64">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <UserOverview />
          <div className="grid gap-8 md:grid-cols-1">
            <LiveTracking />
            {/* <RewardsSection /> */}
          </div>
          <Leaderboard />
        </div>
      </main>
    </div>
  );
};

export default MainDashboard;
