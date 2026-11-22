P17 CAMPUS EVENT DISCOVERY PROTOTYPE

Purpose
This is a clickable high-fidelity prototype for Happening @ LPU, a campus-event discovery extension of the UMS-style student interface. It is intended for CP5 walkthroughs and CP6 usability testing.

Student-facing preview
Open the website normally, without adding ?manage=1. The student view contains the flows represented in the paper prototype:

- Dashboard and event discovery
- Personalized recommendations (For you)
- My Events
- Event reminders
- Real-time updates
- Categories
- Event details, registration and reminder actions

Evaluator-only management route
Append ?manage=1 to open the separate local management screen. This route is included only to demonstrate how an organiser could add, edit, cancel or remove an event during a prototype walkthrough. It is not part of the student-facing test flow.

Before sharing with student participants
Open config.js and set showEventManager to false. Then share the normal student-facing address without ?manage=1. This hides and disables the management route for student testing.

Run locally
1. Open a terminal in the folder containing this README.
2. Run: python -m http.server 8000
3. Open: http://localhost:8000

Prototype boundaries
- Event listings and registrations are sample content for interaction testing, not confirmed university announcements.
- The prototype does not connect to LPU UMS and does not send real registrations, reminders or notifications.
- Saving, registration, reminders and event updates are simulated in the current browser only.
- Event edits are stored in browser local storage. Use the same browser to see saved changes.
- The management route is for walkthrough purposes and should remain disabled during student testing.

Demonstration dates
The demo clock starts at 18 November 2026. On each new local calendar day, event dates move forward by one day. Reopening the prototype after several days catches the dates up automatically. This keeps the event cards usable during repeated demonstrations without changing the interaction flow.

Resetting the demonstration
To return to the original sample content, clear this site's local storage in the browser.
