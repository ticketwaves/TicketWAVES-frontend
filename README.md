# TicketWAVES v3.2 — focused stability update

This replacement is based on the uploaded v31 project. It keeps the existing TicketWAVES pages and APIs and focuses on the requested fixes:

- Atomic ticket transfer ownership change.
- Accepted transfer cannot be transferred again by the sender.
- Accepted transfers repair stale ownership records when the recipient opens My Tickets.
- Recipient first name, surname and email are retained on transfers.
- New recipients can create an account from the transfer link and are automatically claimed into My Tickets.
- Discover / For You event cards are smaller and responsive: horizontal on larger screens, vertical on phones.
- My Tickets uses the same event-card visual language as Discover and exposes Section / Row / Seat before View Ticket.
- View Ticket opens the full mobile ticket screen with the rotating/refreshing secure QR.
- Ticket detail now includes order reference and ticket-holder name.
- Existing admin event editing, artwork upload/URL, currency, giveaway and sell tools are preserved.

## Deployment

1. Back up the current frontend and backend repositories.
2. Deploy `backend/` to the existing Render Web Service. Keep the same PostgreSQL database and environment variables.
3. Wait for logs showing `TicketWAVES API listening on 0.0.0.0:10000` and `TicketWAVES PostgreSQL connected`.
4. Deploy the `frontend/` files to the existing GitHub Pages repository.
5. Test a transfer with a test ticket:
   - Sender sends one ticket.
   - Recipient opens the transfer link.
   - New recipient creates an account using the transfer email.
   - Acceptance completes.
   - Recipient opens My Tickets and sees the ticket.
   - Sender refreshes My Tickets and no longer sees that ticket.
   - Sender cannot transfer that same ticket again.
6. Test the View Ticket QR and verification page after the ownership change.

## Important

Do not wipe the existing PostgreSQL database. The backend includes startup migrations for transfer/ticket ownership columns so older TicketWAVES databases can be upgraded without deleting ticket data.
