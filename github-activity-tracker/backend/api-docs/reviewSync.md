Description

This API starts a pull-request reviews synchronization across all repositories in the database. It uses GitHub’s GraphQL API to fetch PRs and their review pages, inserting reviewer activity and updating contributor review counts.

Endpoint

POST /admin/sync/reviews

Method

POST

Authentication

Handled outside this route. The route itself is open to callers.

Request Body

None.

Response

Returns the number of repositories processed and the total count of reviews inserted or updated.

Processing Steps

Load all repositories from the database.

For each repository, execute the syncReviews(repoId) service.

The service queries GitHub using a GraphQL paginated pull-request query.

For each PR, reviews are fetched in pages until no more results exist.

Reviews authored by the same user who created the PR are ignored.

Reviewer details are inserted or updated in github_users.

The repo_users table review counters and timestamps are updated.

Each review is recorded as an activity event using an idempotent insert to prevent duplicates.

Error Handling

Handles repository-not-found cases with a 404 response.
Any other unexpected error returns a 500 response.
Individual PR or review processing errors do not stop the sync loop for other repositories.

Notes

Uses GitHub GraphQL API because REST endpoints provide incomplete review pagination. GraphQL allows efficient paging of nested PR review connections.