const db = require("../db/db");

/* ---------------------------------------------
   Calculate date ranges
--------------------------------------------- */
function getDateRange(period) {
  const now = new Date();

  if (period === "all") {
    return { start: null, end: null };
  }

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  let days = 7;

  if (period === "daily") days = 1;
  if (period === "weekly") days = 7;
  if (period === "monthly") days = 30;

  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return { start, end };
}

/* ---------------------------------------------
   MAIN SERVICE
--------------------------------------------- */
const getLeaderboard = async (orgId, period = "weekly", limit = 10) => {
  limit = parseInt(limit) || 10;

  const { start, end } = getDateRange(period);

  let query = `
    SELECT
      u.login,
      u.avatar_url AS avatar,
      COUNT(*) FILTER (WHERE e.event_type = 'commit') AS commits,
      COUNT(*) FILTER (WHERE e.event_type = 'pr') AS prs,
      COUNT(*) FILTER (WHERE e.event_type = 'review') AS reviews,
      COUNT(*) AS score
    FROM activity_events e
    JOIN github_users u ON u.id = e.user_id
  `;

  const params = [];

  if (start && end) {
    query += ` WHERE e.created_at BETWEEN $1 AND $2 `;
    params.push(start.toISOString(), end.toISOString());
  }

  query += `
    GROUP BY u.id, u.login, u.avatar_url
    ORDER BY score DESC
    LIMIT ${limit};
  `;

  const result = await db.query(query, params);

  const leaderboard = result.rows.map((row, index) => ({
    rank: index + 1,
    login: row.login,
    avatar: row.avatar,
    commits: Number(row.commits),
    prs: Number(row.prs),
    reviews: Number(row.reviews),
    score: Number(row.score),
  }));

  return {
    period,
    leaderboard,
  };
};

module.exports = {
  getLeaderboard,
};