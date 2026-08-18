TicketWAVES frontend v28

Replace the frontend files with this package and deploy to the existing GitHub Pages TicketWAVES-frontend repository.

Fixes included:
- Uses config.js backend URL instead of the old hard-coded backend-3 URL.
- Payment callback uses the current backend and performs one authenticated verification call.
- Notifications page with unread badge and transfer Accept/Decline actions.
- Transfer links use accept-transfer.html and the token flow.
- Login/register with a transfer token automatically accepts the transfer into My Tickets.
- Admin dashboard now has Transfer Ticket and reserves/forwards admin tickets through the backend endpoint.
- Service-worker cache bumped and payment/transfer pages are always fetched fresh.
- Existing Discover, For You, Sell, Account, seat/event checkout, My Tickets, QR/share and admin tools are preserved.

Frontend URL: https://ticketwaves.github.io/TicketWAVES-frontend
Backend URL: https://ticketwaves-backend-k1hs.onrender.com
