require('dotenv').config();
const express = require('express');
const cors = require('cors');
const repoSyncRoute = require('./routes/repoSyncRoute');
const commitSyncRoute = require('./routes/commitSyncRoute');
const prSyncRoute = require('./routes/prSyncRoute');
const reviewSyncRoute = require('./routes/reviewSyncRoute');
const orgUsersRoute = require('./routes/orgUsersRoute');
const orgSummaryRoute = require('./routes/orgSummaryRoute');
const userDetailsRoute = require('./routes/userDetailsRoute');
const orgActivityRoute = require("./routes/orgActivityRoute");
const leaderboardRoute = require("./routes/leaderboardRoute");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'GitHub Activity Tracker API',
    endpoints: {
      'POST /admin/sync/repos': 'Sync repositories for an organization',
      'POST /admin/sync/commits': 'Sync commits for all repositories in DB',
      'POST /admin/sync/prs': 'Sync PRs for all repositories in DB',
      'POST /admin/sync/reviews': 'Sync PR reviews for all repositories in DB',
    },
  });
});

app.use(repoSyncRoute);
app.use(commitSyncRoute);
app.use(prSyncRoute);
app.use(reviewSyncRoute);
app.use(orgUsersRoute);
app.use(orgSummaryRoute);
app.use(userDetailsRoute);
app.use(orgActivityRoute);
app.use("/", leaderboardRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
