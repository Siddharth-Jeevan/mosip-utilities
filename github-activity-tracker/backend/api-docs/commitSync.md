Description

This API triggers a commit synchronization process for every repository stored in the database. It iterates over all repositories, fetches their commit history from GitHub using the GitHub REST API, updates the local database, and records commit activity events. The underlying logic is handled by the syncCommits service.

Endpoint

POST /admin/sync/commits

Method

POST

Authentication

Handled externally if required. This route itself does not include auth checks.

Request Body

No request body is required.

Response

The API returns a JSON object containing the number of repositories processed and the total number of commits synced successfully. If the repos table is empty, it responds with a success message indicating no repositories found.

Processing Steps

Fetch all repositories from the database along with their GitHub repository ID, owner, name, and full name.

Iterate through each repository one by one.

For each repository, call the syncCommits(repoId) service function.

The service fetches commits from GitHub with pagination, filters based on the last synced timestamp, inserts or updates GitHub users, updates repo users with commit counts, and stores commit events in the activity events table.

The route logs sync progress and keeps a running total of all processed commits.

A short delay is applied between each repository to avoid rate limits.

Error Handling

If any single repository fails during syncing, the process continues with the remaining repositories.
If a repository referenced by ID is missing, a 404 response is returned.
Unexpected errors return a 500 response containing a generic error message, with stack traces only included in development mode.

Notes

This route triggers a full multi-repository sync and is intended for admin or background tasks. It uses a sequential loop to avoid API throttling.