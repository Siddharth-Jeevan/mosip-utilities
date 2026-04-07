Description

This API returns a paginated list of users associated with repositories in the system.
It aggregates each user’s total commits, pull requests, reviews, and overall activity by summarizing values from the repo_users table.
Pagination is handled through query parameters, while the computation and database interaction are performed by the getOrgUsers service.

Endpoint

GET /orgs/:org_id/users

Method

GET

Authentication

Handled outside this route. The route itself does not enforce authorization.

Request Parameters

Path parameter:
org_id — Required. Must be a non-empty string. The current implementation validates only the format, not actual organization membership.

Query parameters:
page — Optional. Defaults to 1. Must be a positive integer.
limit — Optional. Defaults to 20 if not provided. Must be a valid integer if supplied.

Response

Returns an array of user objects, each containing login, avatar URL, total commits, total PRs, total reviews, and total activity count.
The response reflects aggregated activity across all repositories.

Processing Steps

Validate the presence and datatype of org_id.

Parse and validate the page value.

Use provided limit or fallback to a default value.

Call getOrgUsers(page, limit) which:

Computes pagination offset.

Executes an aggregation query joining github_users and repo_users.

Sums commit, PR, and review counts per user.

Orders users by total activity in descending order.

Returns a structured list of users.

Respond with the formatted user activity list.

Error Handling

If org_id is missing or invalid, a 400 error is returned.
If page is less than 1, a 400 error is returned.
Any unhandled error results in a 500 response with a generic internal server error message.

Notes

This endpoint currently does not filter users by organization. It returns all users across all repositories stored in the system.
If organization-level filtering is required in the future, additional conditions must be added to the SQL query joining repos to repo_users.