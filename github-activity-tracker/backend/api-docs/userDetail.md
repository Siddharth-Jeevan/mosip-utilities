Description

This API returns complete activity details for a specific user within an organization. It powers the User Detail page by providing user information, KPI summaries, trend charts, weekly or monthly overviews, and a day-wise activity table. The logic is handled by the `getUserDetails` service, which aggregates data exclusively from the `github_users` and `activity_events` tables. No GitHub API calls are made.

Endpoint

GET /orgs/:org_id/users/:login

Example:
GET /orgs/mosip/users/Prafulrakhade?period=monthly

Method

GET

Authentication

Handled externally if required. The route itself does not include authentication checks.

Query Parameters 

period (required): daily, weekly, or monthly. Determines the range of activity returned.

Response

The API returns:

- Basic user details (login, avatar, name/email if present in the DB).
- KPI totals for commits, pull requests, and reviews.
- Percentage changes compared to the previous period.
- Chart-ready arrays for weekly or monthly overviews.
- A trend chart representing activity per day.
- A fully populated day-wise activity table containing 1, 7, or 30 rows depending on the selected period. Missing days are filled with zeros.

Processing Steps

1. Fetch the user record from the `github_users` table using the provided login.
2. Compute date ranges based on the selected period (today, last 7 days, or last 30 days).
3. Query `activity_events` for daily counts of commits, pull requests, and reviews.
4. Generate a date range and fill missing days with zeros.
5. Compute total activity for the current period.
6. Compute percentage change compared to the previous period using the same logic as the org summary API.
7. Prepare arrays needed for the trend chart (daily) and overview chart (weekly groups during monthly mode).
8. Return all assembled data in a structured JSON format.

Error Handling

- If the login does not exist in `github_users`, a 404 response is returned.
- Invalid or missing period parameters return a 400 response.
- Unexpected failures return a 500 response with a generic error message. Detailed stack traces are included only in development mode.

Notes

- The API is completely read-only and uses only local database tables.
- The daily activity list always contains exactly 1, 7, or 30 rows.
- The API eliminates the need for frontend-side aggregation or date handling by returning chart-ready arrays.