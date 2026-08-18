TicketWAVES SAFE FIX v1

SOURCE:
- index.html is based on the exact index(20260818-140801).html uploaded by the user.
- All other frontend files are the exact uploaded versions.

ONLY CHANGES TO index.html:
1. /api/tickets/me response compatibility:
   accepts both an array and the deployed backend response { success:true, tickets:[...] }.
2. /api/tickets/:id response compatibility:
   accepts both a direct ticket and { success:true, ticket:{...} }.
3. /api/tickets/public/:share response compatibility:
   accepts both a direct ticket and { success:true, ticket:{...} }.

NO CSS/layout redesign.
NO event data changes.
NO authentication changes.
NO payment code changes.
NO backend code changes.

The backend logs showed GET /api/tickets/me returning HTTP 200. The deployed backend returns
{success:true,tickets:[...]} while the old frontend was only accepting an array, so it converted
the successful response to [] and displayed no tickets. This patch fixes that mismatch.
