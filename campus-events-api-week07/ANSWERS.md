# Week 7 Answers

## Why does Booking store eventId, while Event has no bookingIds column?

The foreign key belongs on the many side of a one-to-many relationship, so each Booking stores the ID of its Event. Event can retrieve its bookings by querying that foreign key; a separate bookingIds list would duplicate relationship data and need extra synchronization.

## Why store booked, and how do we keep it correct?

Storing `booked` makes it quick to check availability without counting and summing every booking for each event view. The code must update `booked` in the same transaction as creating or deleting a booking, and new bookings must use a conditional database update so concurrent requests cannot exceed capacity.

## What is the difference between migrate dev and generate?

`prisma migrate dev` creates and applies a migration, so it changes the development database. `prisma generate` only rebuilds the typed Prisma Client from the schema; it does not change the database.

## What is the N+1 query problem, and how does include help?

The N+1 problem happens when a page first fetches its 20 events and then makes one extra query per event to fetch bookings, for 21 queries total. Use `prisma.event.findMany({ include: { bookings: true } })` to fetch events with their bookings together instead of issuing a separate application query for every event.

## Why can read-check-update oversell the last seat, and why does updateMany prevent it?

Two requests can both read the same one-seat remainder, both pass a JavaScript check, and both increment `booked` because their reads happened before either write. A conditional `updateMany` checks `booked <= capacity - requestedSeats` as part of the database update; concurrent updates serialize on the row and a later request no longer matches once capacity is reached.
