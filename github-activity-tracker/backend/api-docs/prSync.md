Description

This API initiates synchronization of pull requests for all repositories stored in the database. It uses the GitHub Search API to fetch PR metadata, update contributor information, track PR events, and store activity in the database.

Endpoint

POST /admin/sync/prs

Method

POST

Authentication

Handled externally. The route itself performs no authorization checks.

Request Body

None.

Response

Returns the number of repositories processed and the total count of PRs synchronized.

Processing Steps

Retrieve all repositories from the database.

Loop through each repository and call syncPRs(repoId).

The PR sync service uses GitHub Search API pagination (up to 1000 items) and fetches PRs created since the last synchronization timestamp.

Each PR's author is inserted or updated in the github_users table.

The repo_users table is updated by incrementing PR counts and updating timestamps.

PR events are inserted into the activity_events table with conflict-handling to avoid duplicates.

Each repository update is done sequentially to reduce GitHub rate-limit risks.

Error Handling

Handles 404 errors if a repository ID does not exist.
Handles GitHub Search API 422 errors when tokens lack access or the query fails, returning a specific message.
Other failures return a 500 response, including optional error text in development mode.

Notes

Uses GitHub Search API, not the commits API, because search results provide easier filtering and pagination for PRs. All PRs are processed in descending creation order.