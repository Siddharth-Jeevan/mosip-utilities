import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";

import { StatsCard } from "./components/StatsCard";
import ActivityChart from "./components/ActivityChart";
import TopNav from "./components/TopNav";
import TeamMembers from "./components/TeamMembers";
import LeaderboardCard from "./components/LeaderboardCard";
import UserProfile from "./components/UserProfile";

import {
  fetchUsers,
  fetchOrgSummary,
  fetchOrgActivity,
  fetchLeaderboard,
} from "./lib/api";

import CommitIcon from "./assets/CommitIcon.svg";
import PRIcon from "./assets/PRIcon.svg";
import CodeReviewIcon from "./assets/CodeReviewIcon.svg";
import TotalActivityIcon from "./assets/TotalActivityIcon.svg";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const activePage = location.pathname.includes("leaderboard")
    ? "leaderboard"
    : "dashboard";

  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  const [users, setUsers] = useState<string[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [activityChartData, setActivityChartData] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const list = await fetchUsers();
        setUsers(list);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    }
    loadUsers();
  }, []);

  useEffect(() => {
    async function loadSummary() {
      try {
        setSummaryLoading(true);
        setSummaryError(null);
        const data = await fetchOrgSummary("mosip", period);
        setSummary(data);
      } catch {
        setSummaryError("Failed to load summary");
      } finally {
        setSummaryLoading(false);
      }
    }
    loadSummary();
  }, [period]);

  useEffect(() => {
    async function loadActivity() {
      try {
        setActivityLoading(true);
        setActivityError(null);
        const data = await fetchOrgActivity("mosip", period);
        setActivityChartData(data);
      } catch {
        setActivityError("Failed to load activity");
      } finally {
        setActivityLoading(false);
      }
    }
    loadActivity();
  }, [period]);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLeaderboardLoading(true);
        setLeaderboardError(null);

        const data = await fetchLeaderboard("mosip", period, 10);
        const list = Array.isArray(data) ? data : data?.leaderboard || [];

        setLeaderboard(
          list.map((u: any) => ({
            name: u.login,
            team: "—",
            project: "—",
            commits: u.commits,
            prs: u.prs,
            reviews: u.reviews,
            total: u.score,
          }))
        );
      } catch {
        setLeaderboardError("Failed to load leaderboard");
      } finally {
        setLeaderboardLoading(false);
      }
    }
    loadLeaderboard();
  }, [period]);

  const isLoading =
    summaryLoading || activityLoading || leaderboardLoading;

  const error =
    summaryError || activityError || leaderboardError;

  const handleSelectUser = (name: string) => {
    navigate(`/profile/${name}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {!location.pathname.includes("/profile") && (
        <TopNav
          activePage={activePage}
          onChange={(page) => navigate(`/${page}`)}
          title="GitHub Activity Tracker"
          period={period}
          onPeriodChange={setPeriod}
          team="all"
          onTeamChange={() => {}}
          project="all"
          onProjectChange={() => {}}
          onDownloadCSV={() => {}}
          onDownloadJSON={() => {}}
        />
      )}

      <Routes>
        <Route
          path="/dashboard"
          element={
            <main className="font-arimo max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {isLoading && <p>Loading...</p>}
              {error && <p className="text-red-500">{error}</p>}

              {!isLoading && !error && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    <StatsCard title="Total Commits" value={summary?.total_commits ?? 0} change={summary?.change?.commits} icon={CommitIcon} />
                    <StatsCard title="Pull Requests" value={summary?.total_prs ?? 0} change={summary?.change?.prs} icon={PRIcon} />
                    <StatsCard title="Reviews" value={summary?.total_reviews ?? 0} change={summary?.change?.reviews} icon={CodeReviewIcon} />
                    <StatsCard title="Total Activity" value={summary?.total_activity ?? 0} change={summary?.change?.activity} icon={TotalActivityIcon} />
                  </div>

                  <div className="bg-white border rounded-xl shadow-sm p-6 mb-8">
                    <ActivityChart data={activityChartData} period={period} />
                  </div>

                  <TeamMembers
                    team="all"
                    project="all"
                    period={period}
                    onSelectUser={handleSelectUser}
                  />
                </>
              )}
            </main>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <main className="font-arimo max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
              <LeaderboardCard leaders={leaderboard} />
            </main>
          }
        />

        <Route
          path="/profile/:username"
          element={<ProfilePage />}
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

function ProfilePage() {
  const { username } = useParams();

  const navigate = useNavigate();

  return (
    <UserProfile
      userName={username || ""}
      onBack={() => navigate("/dashboard")}
    />
  );
}

export default App;