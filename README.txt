P17 CAMPUS EVENT DISCOVERY PROTOTYPE

Student-facing preview
Open the local website at its normal address, without adding ?manage=1. The student view contains the dashboard, personalized recommendations, My Events, reminders, live updates and categories.

Local event management
Append ?manage=1 to the local website address to open the separate Manage Events screen. It supports adding, editing, cancelling and removing event entries. Changes are saved in the current browser only.

Remove the management screen before sharing
Open config.js and change showEventManager from true to false. This hides and disables the management route. Share the normal student-facing address, without ?manage=1.

Run locally on Windows
1. Open PowerShell in the folder containing this README.
2. Run: python -m http.server 8000
3. Open: http://localhost:8000

Prototype notes
- The included event listings and student registrations are sample content for interaction testing, not confirmed university announcements.
- The app does not connect to LPU UMS or send real reminders, registrations or notifications.
- Event edits are stored in the browser's local storage. Use the same browser to see saved changes.
- To reset the prototype to its original sample content, clear local storage for this site in your browser.
