TicketWAVES Frontend — Safe Transfer + My Tickets Update

USE THESE FILES:
- index.html
- config.js
- sw.js
- accept-transfer.html

This update is based on the existing TicketWAVES frontend file dated 2026-08-18 14:08:01. The visual/layout structure was preserved; this is not a redesign.

MAIN FIXES
1. /api/tickets/me responses are normalized from {success:true,tickets:[...]} so My Tickets displays tickets correctly.
2. Individual ticket responses {success:true,ticket:{...}} are normalized.
3. Shared ticket responses are normalized.
4. Live Render backend fallback is ticketwaves-backend-k1hs.onrender.com.
5. Transfer invitation now uses the backend's supported /transfers/invitation/:token endpoint.
6. Transfer acceptance now uses the backend's supported POST /transfers/accept endpoint.
7. The old unsupported /transfers/token, /transfers/accept-token and /transfers/decline-token frontend calls were removed.
8. accept-transfer.html was added because the backend sends recipients to that filename.
9. A recipient without an account can open the invitation, create an account with the recipient email, and then the frontend accepts the transfer and opens My Tickets.
10. A recipient with an account can sign in using the recipient email and accept the transfer.
11. My Tickets uses a short-lived cache and renders cached tickets immediately, then refreshes from the server.
12. Ticket lists are arranged by event date/time, upcoming events first.
13. GET request de-duplication and short caching reduce duplicate requests and unnecessary waits.
14. Service-worker cache version was bumped and navigation/config/transfer pages are fetched fresh so old broken frontend code is not kept by the browser.
15. Payment reconciliation stays non-blocking so My Tickets does not wait for Paystack verification.

IMPORTANT
- Do not replace the backend with this package.
- Keep your existing payment-callback.html, manifest.webmanifest and other existing frontend files.
- If your GitHub Pages repository already has config.js, use the included config.js so it points to the live Render backend.
- Keep the original frontend backup before committing.

PUBLIC UX RESEARCH USED (NOT COPIED CODE)
- Ticketmaster: transfer flow includes selecting tickets, entering recipient information, acceptance, and the sender's ticket becoming invalid after successful transfer.
- AXS: transfer uses recipient first name, last name, email or phone, with account creation when necessary.
- TicketSwap: tickets can be imported and organized; multi-page files can be split into individual tickets when appropriate.
- StubHub/viagogo: mobile-transfer delivery and e-ticket upload/delivery are separate fulfillment paths.

No proprietary source code from these services is copied. Their publicly documented workflows were used only as product/UX reference.
