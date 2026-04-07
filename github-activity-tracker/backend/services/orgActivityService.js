const pool = require("../db/db");
const dayjs = require("dayjs");

/**
 * Returns org-wide daily activity for chosen period
 */
async function getOrgActivity(period) {
  let days = 7;

  if (period === "daily") days = 1;
  if (period === "monthly") days = 30;

  const end = dayjs().endOf("day");
  const start = end.subtract(days - 1, "day").startOf("day");

  const result = await pool.query(
    `
    SELECT
      DATE(created_at) AS date,
      COUNT(*) FILTER (WHERE event_type = 'commit') AS commits,
      COUNT(*) FILTER (WHERE event_type = 'pr') AS prs,
      COUNT(*) FILTER (WHERE event_type = 'review') AS reviews
    FROM activity_events
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at);
    `,
    [start.toDate(), end.toDate()]
  );

  // Generate empty date → fill zeros
  const labels = [];
  const commits = [];
  const prs = [];
  const reviews = [];
  const total = [];

  const map = {};
  result.rows.forEach((r) => {
    map[dayjs(r.date).format("YYYY-MM-DD")] = r;
  });

  for (let i = 0; i < days; i++) {
    const d = start.add(i, "day").format("YYYY-MM-DD");
    labels.push(d);

    const row = map[d] || { commits: 0, prs: 0, reviews: 0 };

    // ✅ FIXED: ensure numeric addition
    const c = Number(row.commits);
    const p = Number(row.prs);
    const r = Number(row.reviews);

    commits.push(c);
    prs.push(p);
    reviews.push(r);
    total.push(c + p + r);
  }

  return { labels, commits, prs, reviews, total };
}

module.exports = { getOrgActivity };