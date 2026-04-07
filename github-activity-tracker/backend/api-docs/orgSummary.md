Description

This API returns an activity summary for an organization over a given time period.
It aggregates commit, pull-request, and review activity from the activity_events table and compares the current period to the previous equivalent period.
The route delegates processing to the getOrgSummary service, which handles date-range calculations, database queries, and percentage change computation.

Endpoint

GET /orgs/:org_id/summary

Method

GET

Authentication

Managed externally. The route itself does not enforce authentication.

Request Parameters

Path parameter:
org_id — Required. Must be a valid organization identifier (validated only for presence).

Query parameter:
period — Optional. Accepts daily, weekly, or monthly. Defaults to weekly.

Response

Returns a JSON summary containing counts of commits, PRs, and reviews for the current time window, along with their percentage change compared to the previous period.

Processing Steps

Validate that org_id is present.

Validate the period query parameter; allowed values are daily, weekly, and monthly.

Call getOrgSummary(period), which:

Computes the current and previous date ranges based on the selected period.

Fetches event counts from the activity_events table for each range.

Calculates percentage change across commits, PRs, reviews, and total activity.

Return the aggregated summary as the response.

Error Handling

If org_id is missing, the route returns a 400 error.
If the period value is invalid, a 400 error is returned.
Unexpected errors return a 500 response with a generic internal server error message.

Notes

This endpoint summarizes activity across the entire system and does not filter by organization in the current implementation. It uses timestamps on activity_events to compute engagement across time ranges. If organization-specific filtering is later required, the underlying SQL queries must be updated.