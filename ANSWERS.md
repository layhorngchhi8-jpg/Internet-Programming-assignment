# Week 4 Answers

## 1. Why not use the array index as `:key` in EventList?
An array index can change when the list is filtered, so Vue may reuse a component instance for a different event. If a card has local state, such as an open details panel, that state can appear on the wrong event. Using the stable event ID lets Vue track the correct card.

## 2. Why is `visible` a computed instead of a function called from the template?
`visible` is derived from the events, search text, and selected category, so `computed` expresses that relationship and caches the result until one of its reactive dependencies changes. When the user types, Vue recalculates the computed value as needed and updates the list. A function called during rendering may run again on every render, even when its inputs have not changed.

## 3. Why does EventCard emit `book` instead of changing `event.booked`?
Props are read-only, so changing `event.booked` inside EventCard would mutate data owned by its parent. Emitting `book` tells the parent which event the user wants to book, while keeping the data change in the component that owns the events. This separates displaying a card from managing booking rules.

## 4. Why might `const { booked } = reactive(event); booked++` fail to update the page?
Destructuring a property from a reactive object copies its current value into a local variable, disconnecting that variable from the reactive proxy. Incrementing the local `booked` variable does not trigger Vue's reactivity for `event.booked`. Update the property through the reactive object instead, such as `event.booked++`.

## 5. Where does `myBookings` live, and why?
`myBookings` lives in `App.vue`, because App owns the events and coordinates booking changes. EventCard only displays one event and emits a booking request, while EventList displays and filters cards and passes booking events upward. Keeping the booking state in App gives the header, cards, and persistence logic one shared source of truth.
