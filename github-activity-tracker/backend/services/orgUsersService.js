const db = require("../db/db");

const DEFAULT_LIMIT = 20;

/* ------------------------------------------------
   Determine date ranges for daily/weekly/monthly
------------------------------------------------ */
function getDateRanges(period) {
  const periods = {
    daily: 1,
    weekly: 7,
    monthly: 30,
  };

  const days = periods[period] || 7;

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  prevEnd.setHours(23, 59, 59, 999);

  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - (days - 1));
  prevStart.setHours(0, 0, 0, 0);

  return { start, end, prevStart, prevEnd };
}

/* -----------------------------------------------
   Difference helper
------------------------------------------------ */
function diff(current, previous) {
  return current - previous;
}

/* ------------------------------------------------
   MAIN FUNCTION WITH PAGINATION
------------------------------------------------ */
const getOrgUsers = async (
  orgId,
  period = "weekly",
  page = 1,
  limit = DEFAULT_LIMIT,
) => {
  // ensure numbers
  page = parseInt(page) || 1;
  limit = parseInt(limit) || DEFAULT_LIMIT;

  const { start, end, prevStart, prevEnd } = getDateRanges(period);

  /* 1️⃣ Fetch users */
  const usersQuery = `
    SELECT
      u.id,
      u.login AS login,
      u.avatar_url AS avatar
    FROM github_users u
    ORDER BY u.login ASC;
  `;

  const usersRes = await db.query(usersQuery);
  const users = usersRes.rows;

  /* 2️⃣ Current period activity */
  const activityQuery = `
    SELECT
      user_id,
      COUNT(*) FILTER (WHERE event_type = 'commit') AS commits,
      COUNT(*) FILTER (WHERE event_type = 'pr') AS prs,
      COUNT(*) FILTER (WHERE event_type = 'review') AS reviews
    FROM activity_events
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY user_id;
  `;

  const currentRes = await db.query(activityQuery, [
    start.toISOString(),
    end.toISOString(),
  ]);

  const currentMap = {};

  currentRes.rows.forEach((row) => {
    currentMap[row.user_id] = {
      commits: Number(row.commits),
      prs: Number(row.prs),
      reviews: Number(row.reviews),
    };
  });

  /* 3️⃣ Previous period activity */
  const previousRes = await db.query(activityQuery, [
    prevStart.toISOString(),
    prevEnd.toISOString(),
  ]);

  const previousMap = {};

  previousRes.rows.forEach((row) => {
    previousMap[row.user_id] = {
      commits: Number(row.commits),
      prs: Number(row.prs),
      reviews: Number(row.reviews),
    };
  });

  /* 4️⃣ Construct final user list */
  const final = users.map((u) => {
    const current = currentMap[u.id] || { commits: 0, prs: 0, reviews: 0 };
    const previous = previousMap[u.id] || { commits: 0, prs: 0, reviews: 0 };

    return {
      login: u.login,
      avatar: u.avatar,

      commits: current.commits,
      prs: current.prs,
      reviews: current.reviews,

      diffCommits: diff(current.commits, previous.commits),
      diffPRs: diff(current.prs, previous.prs),
      diffReviews: diff(current.reviews, previous.reviews),

      total_activity: current.commits + current.prs + current.reviews,
    };
  });

  /* 5️⃣ Sort by activity */
  final.sort((a, b) => b.total_activity - a.total_activity);

  /* 6️⃣ Pagination */
  const totalUsers = final.length;
  const totalPages = Math.ceil(totalUsers / limit);

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const usersPage = final.slice(startIndex, endIndex);

  /* 7️⃣ Return paginated response */

  return {
    users: usersPage,
    page,
    limit,
    totalUsers,
    totalPages,
  };
};

module.exports = {
  getOrgUsers,
};
