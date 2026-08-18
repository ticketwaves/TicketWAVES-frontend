# TicketWAVES v30 — transfer + giveaway + mobile ticket update

This package is a direct update of the supplied V29 source. Existing frontend/backend files are preserved and the following issues are addressed:

- Transfer acceptance for existing users and brand-new users.
- New users are sent to account creation after opening an email transfer link.
- The transfer token survives registration/login and returns the recipient to the claim flow.
- Accepted transfers are repaired into `My Tickets` from the accepted transfer record if ownership was stale.
- Recipient ownership changes on acceptance and the sender's ticket is no longer valid for entry.
- QR verification shows the server-verified holder name/surname plus event, seat, ticket code and verification time.
- Dynamic secure QR codes refresh every 15 seconds.
- Admin control room remains available for accounts with the configured `ADMIN_EMAIL`.
- Admin Events now support an image URL or a small phone image upload.
- Admin Giveaways now have a complete create/send form, event artwork, winner email, seat details, notes and resend.
- Giveaways are delivered through the same secure claim/transfer flow, so a new winner creates an account before the ticket is claimed.
- Ticket page follows the current mobile-ticket information hierarchy used by major ticketing apps while keeping TicketWAVES branding and implementation.

## Deployment

1. Deploy `backend/` to the existing Render backend repository.
2. Keep your existing Render environment variables:
   - DATABASE_URL
   - JWT_SECRET
   - PAYSTACK_SECRET_KEY
   - PUBLIC_API_URL
   - FRONTEND_URL
   - ADMIN_EMAIL
   - your email provider variables
3. Wait for Render to show the API as live.
4. Confirm `/api/health` reports `database: connected`.
5. Upload the `frontend/` files to the GitHub Pages frontend repository.
6. Sign in using the configured admin email to reveal the Admin control room.
7. Test in this order:
   - create event + image
   - create giveaway + recipient email
   - open giveaway email as a new user
   - create the account with the same email
   - accept ticket
   - open My Tickets
   - open the ticket QR
   - verify the QR
   - transfer a normal ticket to another account
   - verify the sender no longer has a valid entry ticket

## Image note

The admin image picker accepts a URL or an image up to 2.5 MB and stores a data URL when a local image is uploaded. For a large production catalog, object storage/CDN is preferable to storing large base64 images in PostgreSQL.

## Design note

The ticket page uses the same broad mobile-ticket information hierarchy found in Ticketmaster's current 2026 redesign—event artwork/details, order information, seat information, entry/security, wayfinding and transfer/sell actions—but it does not copy Ticketmaster's proprietary code, branding or exact protected UI assets.
