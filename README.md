# TicketWAVES v31

Stable replacement based on the uploaded TicketWAVES v30 project.

## Important fixes
- Transfer recipient first name/surname are persisted.
- New recipients are routed through account creation and the pending transfer is automatically claimed after registration.
- Existing recipients are routed through sign-in and then claim the transfer.
- Accepted transfers are repaired into My Tickets using the accepted transfer record as a safety net.
- Giveaway records now persist `ticketId`, `recipientId`, and additional ticket information.
- Existing giveaway claim links remain compatible.
- Admin event editor supports event artwork, ticket price, currency, section, row and seat.
- Existing event list includes ticket currency/price.
- Existing event creation includes currency.
- Existing frontend structure is preserved; backend/public mirrors the frontend.
- Mobile event cards use the TicketWAVES 2026 visual system with image, date, large title, venue and View Tickets action.
- Mobile ticket keeps the secure short-lived QR flow and server verification page.

## Deployment
1. Deploy backend to Render and wait for PostgreSQL to report connected.
2. Keep DATABASE_URL, JWT_SECRET, FRONTEND_URL, PAYSTACK_SECRET_KEY and email variables in Render environment settings.
3. Deploy the frontend folder to GitHub Pages.
4. Test transfer with an unused ticket before using a real customer's ticket.

The UI follows the public information hierarchy and security concepts described by Ticketmaster's 2026 mobile ticket materials, but uses TicketWAVES branding and implementation.
