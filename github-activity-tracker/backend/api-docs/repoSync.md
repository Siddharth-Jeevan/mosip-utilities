Description

This API syncs repositories for a given GitHub organization. It triggers a repository discovery process through the syncRepos service and updates the local database with the fetched repositories.

Endpoint

POST /admin/sync/repos

Method

POST

Authentication

Responsibility of the outer application. No auth enforced here.

Request Body

org: Name of the GitHub organization to sync repositories from. This is required.

Response

Returns the total number of repositories successfully processed and stored.

Processing Steps

Validate that the request includes the required field org.

Call syncRepos(org) to fetch repositories from the GitHub API.

The service pulls all repositories belonging to the organization and updates or inserts them into the repos table.

Once finished, the route responds with the number of repositories processed.

Error Handling

If the 'org' field is missing, the route returns a 400 response.
Any unexpected error results in a 500 response with optional debugging details in development mode.

Notes

This endpoint is required before running any commit, PR, or review syncs, because other sync endpoints rely on repositories being present in the database.