(() => {
  const STORAGE = {
    events: "p17-campus-events-v1",
    registrations: "p17-campus-registrations-v1",
    reminders: "p17-campus-reminders-v1",
    interests: "p17-campus-interests-v1",
    updates: "p17-campus-updates-v1",
    reminderOn: "p17-campus-reminder-setting-v1"
  };
  const seedEvents = [
    { id: "web-workshop", title: "Web Development Workshop", category: "Technical", date: "2026-11-18", time: "09:00", venue: "CSE Block", about: "A practical workshop exploring the basics of modern web development.", benefits: ["Workshop", "Build skills"], icon: "⌘", organizer: "School of Computing" },
    { id: "tech-talk", title: "Tech Talk 2026", category: "Technical", date: "2026-11-19", time: "17:00", venue: "LT-1", about: "An evening talk and discussion with a guest speaker from the technology industry.", benefits: ["Guest speaker", "Q&A"], icon: "⌘", organizer: "School of Computing" },
    { id: "sports-cup", title: "LPU Sports Cup", category: "Sports", date: "2026-11-19", time: "10:00", venue: "Sports Complex", about: "Campus sports competitions with team events and individual matches.", benefits: ["Team events", "Open registration"], icon: "♜", organizer: "Sports Department" },
    { id: "volt-hackathon", title: "Hackathon — Volt 2.0", category: "Technical", date: "2026-11-20", time: "09:00", venue: "MSB Block", about: "A two-day hackathon with coding challenges, team projects and build sessions.", benefits: ["Certificate", "Build skills"], icon: "♜", organizer: "Student Developer Club" },
    { id: "cultural-explorations", title: "Cultural Explorations", category: "Cultural", date: "2026-11-21", time: "18:00", venue: "Open Air Theatre", about: "A campus evening featuring student performances and cultural showcases.", benefits: ["Live performances", "Campus life"], icon: "✦", organizer: "Cultural Affairs" },
    { id: "sustainable-seminar", title: "Seminar: Sustainable Future", category: "Seminars", date: "2026-11-22", time: "11:00", venue: "Erasmus Centre, Block 38", about: "An information session on laboratory standards and sustainable campus practice.", benefits: ["Expert session", "Discussion"], icon: "◉", organizer: "Quality Cell" },
    { id: "gaming-arena", title: "Gaming Arena", category: "Sports", date: "2026-11-23", time: "11:00", venue: "Indoor Sports Arena", about: "Friendly campus gaming matches and an open arena for student teams.", benefits: ["Team play", "Open entry"], icon: "⌑", organizer: "Campus Recreation" },
    { id: "creative-sprint", title: "Creative Coding Sprint", category: "Technical", date: "2026-11-24", time: "14:00", venue: "IT Block, Lab 2", about: "A short collaborative coding session for students to explore a shared challenge.", benefits: ["Team activity", "Hands-on"], icon: "⌘", organizer: "Student Developer Club", status: "cancelled" },
    { id: "culture-openmic", title: "Cultural Open Mic", category: "Cultural", date: "2026-10-28", time: "18:00", venue: "Student Activity Centre", about: "A student open-mic evening with music, poetry and short performances.", benefits: ["Student performances", "Open stage"], icon: "✦", organizer: "Cultural Affairs" }
  ];
  const seedRegistrations = ["tech-talk", "sports-cup", "creative-sprint", "culture-openmic"];
  const seedReminders = ["tech-talk", "sports-cup"];
  const seedUpdates = [
    { id: "update-1", eventId: "sports-cup", title: "Registration is open", text: "Registration for LPU Sports Cup is live now.", type: "Registration", time: "Today, 10:15 a.m.", read: false },
    { id: "update-2", eventId: "tech-talk", title: "Event details updated", text: "The Tech Talk 2026 speaker and agenda details are available.", type: "Event details", time: "Today, 9:40 a.m.", read: false },
    { id: "update-3", eventId: "volt-hackathon", title: "Hackathon — Volt 2.0", text: "Registration is open for the two-day hackathon.", type: "Registration", time: "Yesterday", read: true },
    { id: "update-4", eventId: "cultural-explorations", title: "Cultural Explorations", text: "Event timing and venue details are available.", type: "Event details", time: "Yesterday", read: true }
  ];

  const read = (key, fallback) => {
    try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
    catch { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  if (!localStorage.getItem(STORAGE.events)) write(STORAGE.events, seedEvents);
  if (!localStorage.getItem(STORAGE.registrations)) write(STORAGE.registrations, seedRegistrations);
  if (!localStorage.getItem(STORAGE.reminders)) write(STORAGE.reminders, seedReminders);
  if (!localStorage.getItem(STORAGE.interests)) write(STORAGE.interests, ["Technical", "Cultural", "Sports"]);
  if (!localStorage.getItem(STORAGE.updates)) write(STORAGE.updates, seedUpdates);
  if (!localStorage.getItem(STORAGE.reminderOn)) write(STORAGE.reminderOn, true);

  let events = read(STORAGE.events, seedEvents);
  let registrations = read(STORAGE.registrations, seedRegistrations);
  let reminders = read(STORAGE.reminders, seedReminders);
  let interests = read(STORAGE.interests, ["Technical", "Cultural", "Sports"]);
  let updates = read(STORAGE.updates, seedUpdates);
  let reminderOn = read(STORAGE.reminderOn, true);
  let activeFilter = "All Events";
  let selectedEventId = events[0]?.id;
  let myEventsTab = "Upcoming";
  let toastTimer;
  let editEventId = null;
  const root = document.getElementById("viewRoot");
  const managerEnabled = window.PROTOTYPE_CONFIG?.showEventManager === true;
  const managerMode = new URLSearchParams(location.search).get("manage") === "1";
  const canManage = managerEnabled && managerMode;

  const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const today = () => new Date(new Date().toISOString().slice(0, 10) + "T00:00:00");
  const eventDate = event => new Date(`${event.date}T00:00:00`);
  const isPast = event => eventDate(event) < today();
  const dateBits = event => {
    const date = eventDate(event);
    return { day: date.toLocaleDateString("en-IN", { day: "2-digit" }), month: date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(), weekday: date.toLocaleDateString("en-IN", { weekday: "short" }) };
  };
  const prettyDate = event => eventDate(event).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const prettyTime = event => {
    const [h, m] = event.time.split(":").map(Number);
    return new Date(2000, 0, 1, h, m).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  };
  const eventById = id => events.find(event => event.id === id);
  const catClass = category => String(category || "").toLowerCase().replace(/[^a-z]/g, "");
  const iconFor = event => event?.icon || ({ Technical: "⌘", Cultural: "✦", Sports: "♜", Seminars: "◉" }[event?.category] || "✦");
  const sortedEvents = () => [...events].sort((a, b) => eventDate(a) - eventDate(b) || a.time.localeCompare(b.time));
  const eventTile = event => { const d = dateBits(event); return `<span class="date-tile"><strong>${d.day}</strong><small>${d.month}</small></span>`; };
  const categoryTag = category => `<span class="category-tag ${catClass(category)}">${escapeHtml(category)}</span>`;
  const showToast = message => {
    const toast = document.getElementById("toast"); toast.textContent = message; toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  };
  const saveAll = () => {
    write(STORAGE.events, events); write(STORAGE.registrations, registrations); write(STORAGE.reminders, reminders);
    write(STORAGE.interests, interests); write(STORAGE.updates, updates); write(STORAGE.reminderOn, reminderOn);
  };
  const updateLog = (event, verb) => {
    updates.unshift({ id: `update-${Date.now()}`, eventId: event.id, title: `${event.title} ${verb}`, text: `${event.title}: ${event.date} at ${event.time} · ${event.venue}.`, type: "Event details", time: "Just now", read: false });
    updates = updates.slice(0, 15); write(STORAGE.updates, updates);
  };
  const selected = () => eventById(selectedEventId) || sortedEvents()[0];
  const isRegistered = event => registrations.includes(event.id);
  const hasReminder = event => reminders.includes(event.id);
  const viewName = () => (location.hash || "#dashboard").replace(/^#/, "");

  function setView(view) {
    if (view === "event-manager" && !canManage) { location.hash = "dashboard"; showToast("Event management is available only in the local manage view."); return; }
    location.hash = view;
  }
  function render() {
    events = read(STORAGE.events, seedEvents); registrations = read(STORAGE.registrations, seedRegistrations);
    reminders = read(STORAGE.reminders, seedReminders); interests = read(STORAGE.interests, ["Technical", "Cultural", "Sports"]);
    updates = read(STORAGE.updates, seedUpdates); reminderOn = read(STORAGE.reminderOn, true);
    let view = viewName();
    if (view === "event-manager" && !canManage) { location.hash = "dashboard"; view = "dashboard"; }
    const titles = { dashboard: "Dashboard", "for-you": "Personalized recommendations", "my-events": "My events", reminders: "Event reminders", "live-updates": "Real-time updates", categories: "Categories", "event-manager": "Manage events" };
    document.getElementById("crumbTitle").textContent = titles[view] || "Dashboard";
    document.querySelectorAll("[data-view]").forEach(link => link.classList.toggle("active", link.dataset.view === view || (view === "event-manager" && link.dataset.view === "dashboard")));
    if (["lpu-touch", "lpu-live", "my-class", "your-dost"].includes(view)) { showToast("This prototype focuses on campus event discovery."); location.hash = "dashboard"; return; }
    root.innerHTML = ({
      dashboard: renderDashboard,
      "for-you": renderForYou,
      "my-events": renderMyEvents,
      reminders: renderReminders,
      "live-updates": renderLiveUpdates,
      categories: renderCategories,
      "event-manager": renderManager
    }[view] || renderDashboard)();
    const query = document.getElementById("globalSearch").value.trim();
    if (query) renderSearchResults(query);
  }

  function renderDashboard() {
    const list = sortedEvents().filter(e => e.status !== "cancelled");
    const filterCategory = activeFilter === "All Events" ? null : activeFilter === "For You" ? "For You" : activeFilter;
    const visible = filterCategory === "For You" ? list.filter(e => interests.includes(e.category)) : filterCategory ? list.filter(e => e.category === filterCategory) : list;
    if (!visible.some(e => e.id === selectedEventId)) selectedEventId = visible[0]?.id;
    const detail = visible.length ? selected() : null;
    const featured = list.find(e => e.id === "volt-hackathon") || list[0];
    const happening = list.filter(e => !isPast(e)).slice(0, 3);
    const messageUpdates = updates.filter(u => eventById(u.eventId)).slice(0, 3);
    const filters = ["All Events", "For You", "Sports", "Cultural"];
    return `
      <div class="dashboard-context"><span>Campus events and opportunities</span><span>Event details and reminders</span></div>
      <section id="importantLinks" class="panel quick-links"><div class="section-heading"><div><h2>Important Links</h2></div><button class="btn btn-link" data-action="quick-links">More links ↗</button></div><div class="links-wrap">${["Hostel Booking", "Apply for Edu-Revolution", "RMS", "Fee Dashboard", "Issued Books", "Academic Calendar", "Emergency Numbers", "Certificate Request", "Part-time job", "Security Brochure", "Date Sheet", "Admission Referral"].map((x,i)=>`<a href="#" class="quick-link" data-action="quick-link"><span>${["⌂","✧","▤","₹","▣","▦","+","▤","◷","⌑","▦","↗"][i]}</span>${x}</a>`).join("")}</div></section>
      <section class="dashboard-showcase">
        ${featured ? `<article class="panel showcase-panel spotlight-panel"><span class="panel-ribbon">♧ &nbsp; Featured</span><div class="spotlight-art"><span class="spotlight-stamp">HAPPENING<br>@ LPU</span><span class="spotlight-symbol">${iconFor(featured)}</span><div class="spotlight-date"><b>${dateBits(featured).day}</b><span>${dateBits(featured).month}</span></div></div><div class="spotlight-copy">${categoryTag(featured.category)}<h2>${escapeHtml(featured.title)}</h2><p>${escapeHtml(featured.about)}</p><div class="detail-meta"><span>▦ ${prettyDate(featured)}</span><span>◷ ${prettyTime(featured)}</span><span>⌖ ${escapeHtml(featured.venue)}</span></div><button class="btn btn-primary" data-action="view-event" data-id="${featured.id}">View event details&nbsp; →</button></div></article>` : ""}
        <article class="panel showcase-panel happening-panel"><span class="panel-ribbon">♧ &nbsp; Happening</span><div class="happening-list">${happening.map(e=>`<button class="happening-row" data-action="view-event" data-id="${e.id}"><span class="happening-marker"></span><span><strong>${escapeHtml(e.title)}</strong><small>${dateBits(e).day} ${dateBits(e).month} · ${prettyTime(e)}</small></span></button>`).join("")}</div><button class="btn btn-link" data-view="categories">Browse all events →</button></article>
        <article class="panel showcase-panel messages-panel"><span class="panel-ribbon">♧ &nbsp; My Messages</span><div class="message-list">${messageUpdates.map(u=>{const e=eventById(u.eventId);return `<button class="message-row" data-action="view-event" data-id="${e.id}"><span class="message-bullet"></span><span><strong>${escapeHtml(u.title)}</strong><small>${escapeHtml(u.text)}</small><em>${escapeHtml(u.time)}</em></span></button>`}).join("")}</div><button class="btn btn-link" data-view="live-updates">View all messages →</button></article>
      </section>
      <section class="panel event-panel"><div class="event-panel-header"><div><h2>▦&nbsp; Events &amp; opportunities</h2><p>Find an event that fits your interests and schedule.</p></div><div class="filters">${filters.map(f=>`<button class="chip ${activeFilter===f?"active":""}" data-filter="${f}">${f}</button>`).join("")}</div></div>
        <div class="event-split"><div class="event-list">${visible.length ? visible.map(event=>{const d=dateBits(event);return `<button class="event-row ${detail?.id===event.id?"selected":""}" data-select-event="${event.id}"><span class="date-tile"><strong>${d.day}</strong><small>${d.month}</small></span><span class="event-row-copy"><strong>${escapeHtml(event.title)}</strong><small>◷ ${d.weekday}, ${prettyTime(event)} &nbsp;·&nbsp;⌖ ${escapeHtml(event.venue)}</small>${categoryTag(event.category)}</span><span class="row-chevron">›</span></button>`}).join("") : `<div class="empty-state"><span class="empty-icon">⌕</span><h3>No events in this category</h3><p>Try another filter.</p></div>`}</div>${detail ? renderEventDetail(detail) : `<div class="empty-panel">Select an event to see its details.</div>`}</div>
      </section>
      <div class="grid grid-3 dashboard-lower">${featureCard("✦","Personalized recommendations","Events grouped around the interests you choose.","for-you","Explore recommendations")}${featureCard("◷","Event reminders","Keep track of registered events and reminders.","reminders","Manage reminders")}${featureCard("⌁","Real-time updates","View event announcements and detail changes.","live-updates","See updates")}</div>`;
  }
  function renderEventDetail(event) {
    const status = event.status === "cancelled" ? `<span class="status-pill cancelled">Cancelled</span>` : isPast(event) ? `<span class="status-pill past">Event ended</span>` : isRegistered(event) ? `<span class="status-pill">Registered</span>` : "";
    const primary = event.status === "cancelled" || isPast(event) ? `<button class="btn" disabled>${event.status === "cancelled" ? "Registration cancelled" : "Event ended"}</button>` : `<button class="btn btn-primary" data-action="register" data-id="${event.id}">${isRegistered(event) ? "✓ Registered" : "Register now"}</button>`;
    return `<article class="event-detail"><div class="event-cover"><span class="cover-icon">${iconFor(event)}</span>${categoryTag(event.category)}</div><div class="section-heading" style="margin:14px 0 0"><div><h3>${escapeHtml(event.title)}</h3>${status}</div><button class="icon-button" title="Share event" data-action="share" data-id="${event.id}">⌯</button></div><div class="detail-meta"><span>▦ ${prettyDate(event)}</span><span>◷ ${prettyTime(event)}</span><span>⌖ ${escapeHtml(event.venue)}</span></div><p class="description">${escapeHtml(event.about)}</p><div class="section-heading" style="margin:0"><h2 style="font-size:12px">What to expect</h2></div><div class="benefit-list">${(event.benefits || []).map(b=>`<span class="benefit"><b>✓</b>${escapeHtml(b)}</span>`).join("")}</div><div class="detail-actions">${primary}<button class="btn" data-action="remind" data-id="${event.id}">${hasReminder(event)?"◷ Reminder on":"♧ Remind me"}</button><span style="margin-left:auto;color:#8994a2;font-size:10px">Organized by ${escapeHtml(event.organizer || "Campus team")}</span></div></article>`;
  }
  function featureCard(icon,title,description,view,link) { return `<article class="panel feature-card"><span class="tile-icon">${icon}</span><h3>${title}</h3><p>${description}</p><button class="btn btn-link" data-view="${view}">${link} →</button></article>`; }

  function renderForYou() {
    const recommended = sortedEvents().filter(e=>e.status!=="cancelled" && interests.includes(e.category) && !isPast(e));
    return `<div class="page-head"><div><p class="eyebrow">Events &amp; opportunities</p><h1>Personalized recommendations</h1><p>Choose the event areas you want to follow. Recommendations update with your selections.</p></div><div class="head-actions"><button class="btn" data-view="categories">Browse categories</button></div></div>
      <section class="panel recommend-hero"><div><p class="eyebrow">For you</p><h2>Recommended for you</h2><p>Explore upcoming events in the categories that interest you. Edit your interests any time.</p><div class="interest-picks">${["Technical","Cultural","Sports","Seminars"].map(c=>`<label class="interest-pick"><input type="checkbox" data-interest="${c}" ${interests.includes(c)?"checked":""}><span>${c}</span></label>`).join("")}</div></div><span class="cover-icon">✦</span></section>
      <div class="section-heading" style="margin:22px 1px 13px"><div><h2>Upcoming for you</h2><p>${recommended.length} events match your selected interests</p></div><button class="btn btn-link" data-view="dashboard">All events →</button></div>
      ${recommended.length ? `<div class="recommend-grid">${recommended.map(renderRecommendCard).join("")}</div>` : `<div class="panel empty-state"><span class="empty-icon">✦</span><h3>No matching upcoming events</h3><p>Select another interest to see more recommendations.</p></div>`}`;
  }
  function renderRecommendCard(event) { const d=dateBits(event); return `<article class="panel recommend-card"><div class="card-art"><span class="cover-icon">${iconFor(event)}</span><button class="save-button ${hasReminder(event)?"saved":""}" title="Toggle event reminder" data-action="remind" data-id="${event.id}">${hasReminder(event)?"♥":"♡"}</button></div><div class="recommend-body">${categoryTag(event.category)}<h3>${escapeHtml(event.title)}</h3><div class="detail-meta"><span>▦ ${d.weekday}, ${prettyDate(event)}</span><span>◷ ${prettyTime(event)}</span><span>⌖ ${escapeHtml(event.venue)}</span></div><p>${escapeHtml(event.about)}</p><button class="btn" data-action="view-event" data-id="${event.id}">View event details</button></div></article>`; }

  function getRegisteredEvents(tab) {
    return registrations.map(eventById).filter(Boolean).filter(e => {
      if (tab === "Upcoming") return !isPast(e) && e.status !== "cancelled";
      if (tab === "Past") return isPast(e);
      return e.status === "cancelled";
    }).sort((a,b)=>eventDate(a)-eventDate(b));
  }
  function renderMyEvents() {
    const list = getRegisteredEvents(myEventsTab);
    const tabs = ["Upcoming", "Past", "Cancelled"];
    return `<div class="page-head"><div><p class="eyebrow">Your activity</p><h1>My events</h1><p>Track registrations and check the latest details for events you follow.</p></div><div class="head-actions"><button class="btn btn-primary" data-view="dashboard">+ Find an event</button></div></div>
      <section class="panel panel-pad"><div class="tabs">${tabs.map(tab=>`<button class="tab ${myEventsTab===tab?"active":""}" data-my-tab="${tab}">${tab}${tab==="Upcoming"?` <span style="color:#9ba5b1">(${getRegisteredEvents(tab).length})</span>`:""}</button>`).join("")}</div>
        ${list.length ? `<div class="table-wrap"><table class="event-table"><thead><tr><th>Event</th><th>Date &amp; time</th><th>Venue</th><th>Status</th><th></th></tr></thead><tbody>${list.map(event=>`<tr><td><div class="table-event">${eventTile(event)}<span><strong>${escapeHtml(event.title)}</strong><small>${escapeHtml(event.category)} · ${escapeHtml(event.organizer || "Campus team")}</small></span></div></td><td>${prettyDate(event)}<br><small>${prettyTime(event)}</small></td><td>${escapeHtml(event.venue)}</td><td><span class="status-pill ${isPast(event)?"past":event.status==="cancelled"?"cancelled":""}">${isPast(event)?"Attended":event.status==="cancelled"?"Cancelled":"Registered"}</span></td><td><button class="row-action" title="View event" data-action="view-event" data-id="${event.id}">›</button></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty-state"><span class="empty-icon">◷</span><h3>No ${myEventsTab.toLowerCase()} events here</h3><p>${myEventsTab==="Upcoming"?"Browse events and register to keep them in this list.":"Your event history will appear here."}</p></div>`}
      </section><div class="grid grid-2 dashboard-lower"><div class="panel mini-stat"><span class="stat-icon">▦</span><span><strong>${registrations.filter(id=>!!eventById(id)).length}</strong><small>Events in your tracker</small></span></div><div class="panel mini-stat"><span class="stat-icon">♧</span><span><strong>${reminders.length}</strong><small>Reminders set</small></span></div></div>`;
  }

  function renderReminders() {
    const list = sortedEvents().filter(e=>registrations.includes(e.id) && !isPast(e) && e.status!=="cancelled");
    return `<div class="page-head"><div><p class="eyebrow">Stay up to date</p><h1>Event reminders</h1><p>Choose which registered events should send a reminder.</p></div><div class="head-actions"><button class="btn" data-view="my-events">◷&nbsp; My events</button></div></div>
      <section class="panel"><div class="reminder-settings"><span><strong>Event reminder notifications</strong><small>Receive updates before events you have registered for.</small></span><label class="toggle"><input type="checkbox" data-action="toggle-reminder-setting" ${reminderOn?"checked":""}><span></span></label></div></section>
      <div class="section-heading" style="margin:22px 1px 13px"><div><h2>Upcoming registered events</h2><p>Turn reminders on or off for each event.</p></div></div>
      <section class="panel">${list.length ? list.map(event=>`<div class="reminder-row"><span class="reminder-icon">◷</span><span class="reminder-copy"><strong>${escapeHtml(event.title)}</strong><small>${prettyDate(event)} · ${prettyTime(event)} · ${escapeHtml(event.venue)}</small></span><label class="toggle" title="Toggle reminder"><input type="checkbox" data-event-reminder="${event.id}" ${hasReminder(event)?"checked":""} ${reminderOn?"":"disabled"}><span></span></label></div>`).join("") : `<div class="empty-state"><span class="empty-icon">◷</span><h3>No upcoming registrations</h3><p>Register for an event to manage its reminder here.</p></div>`}</section>
      <p style="margin:12px 1px;color:#8d98a6;font-size:10px">Reminder settings are saved in this browser for the prototype.</p>`;
  }

  function renderLiveUpdates() {
    const visible = updates.filter(update => eventById(update.eventId));
    return `<div class="page-head"><div><p class="eyebrow">Campus event feed</p><h1>Real-time updates</h1><p>Recent registration notices and event detail changes.</p></div><div class="head-actions"><button class="btn" data-action="mark-read">Mark all as read</button><button class="btn btn-primary" data-view="reminders">Manage reminders</button></div></div>
      <div class="grid grid-2" style="align-items:start"><section><div class="section-heading"><div><h2>Latest updates</h2><p>Updates shown here are local prototype examples.</p></div></div><div class="update-list">${visible.map(update=>{const event=eventById(update.eventId);return `<article class="panel update-item"><div class="update-top"><strong>${escapeHtml(update.title)}</strong><time>${escapeHtml(update.time)}</time></div><p>${escapeHtml(update.text)}</p><span class="update-label">${escapeHtml(update.type)} · ${escapeHtml(event.category)}</span></article>`}).join("") || `<div class="panel empty-state"><span class="empty-icon">⌁</span><h3>No updates yet</h3><p>Event announcements will appear here.</p></div>`}</div></section>
      <aside class="panel panel-pad"><div class="section-heading"><div><h2>How updates work</h2><p>Event details in one place</p></div></div><div style="display:grid;gap:15px;color:#6f7c8e;font-size:11px;line-height:1.5"><div><strong style="color:#35455e">Registration</strong><br>See when event registration opens or changes.</div><div><strong style="color:#35455e">Venue and time</strong><br>Check updates to event timing and location.</div><div><strong style="color:#35455e">Event information</strong><br>Review agenda and organizer details.</div></div><button class="btn" style="margin-top:19px" data-view="my-events">Open My Events</button></aside></div>`;
  }

  function renderCategories() {
    const categories = [
      { name:"Cultural", title:"Cultural explorations", sub:"Performances, arts and campus culture", icon:"✦" },
      { name:"Sports", title:"Sports and e-sports", sub:"Competitions, teams and gaming", icon:"♜" },
      { name:"Technical", title:"Technical explorations", sub:"Workshops, hackathons and tech talks", icon:"⌘" },
      { name:"Seminars", title:"Seminars and discussions", sub:"Talks, sessions and shared learning", icon:"◉" }
    ];
    return `<div class="page-head"><div><p class="eyebrow">Events &amp; opportunities</p><h1>Browse by category</h1><p>Choose an area to see related campus events.</p></div></div><div class="category-grid">${categories.map(c=>`<button class="category-card" data-category="${c.name}"><span class="tile-icon">${c.icon}</span><h3>${c.title}</h3><p>${c.sub}</p><span style="position:absolute;right:20px;bottom:20px;color:var(--orange);font-size:18px">→</span></button>`).join("")}</div><section class="panel panel-pad" style="margin-top:18px"><div class="section-heading"><div><h2>All upcoming events</h2><p>Browse the current event list.</p></div><button class="btn btn-link" data-view="dashboard">Open event list →</button></div><div class="links-wrap">${sortedEvents().filter(e=>!isPast(e)&&e.status!=="cancelled").map(e=>`<button class="quick-link" data-action="view-event" data-id="${e.id}">${escapeHtml(e.title)} · ${dateBits(e).day} ${dateBits(e).month}</button>`).join("")}</div></section>`;
  }

  function renderManager() {
    const existing = editEventId ? eventById(editEventId) : null;
    return `<div class="page-head"><div><p class="eyebrow">Local prototype tools</p><h1>Manage events</h1><p>Add, edit, cancel or remove event entries used by the student-facing screens.</p></div><div class="head-actions"><button class="btn" data-view="dashboard">← Student view</button></div></div>
      <div class="admin-banner"><span><strong>Management view</strong> · Changes are saved only in this browser.</span><a class="btn btn-soft" href="${location.pathname}">Exit manage view</a></div>
      <div class="manager-layout"><section class="panel panel-pad"><div class="section-heading"><div><h2>${existing?"Edit event":"Add an event"}</h2><p>Enter the event information to show to students.</p></div></div><form id="eventForm" class="form-grid"><div class="field"><label for="eventTitle">Event name</label><input id="eventTitle" name="title" required maxlength="80" value="${escapeHtml(existing?.title||"")}" placeholder="e.g. Design workshop"></div><div class="grid grid-2" style="gap:9px"><div class="field"><label for="eventCategory">Category</label><select id="eventCategory" name="category">${["Technical","Cultural","Sports","Seminars"].map(c=>`<option ${existing?.category===c?"selected":""}>${c}</option>`).join("")}</select></div><div class="field"><label for="eventStatus">Status</label><select id="eventStatus" name="status"><option value="upcoming" ${existing?.status!=="cancelled"?"selected":""}>Upcoming</option><option value="cancelled" ${existing?.status==="cancelled"?"selected":""}>Cancelled</option></select></div></div><div class="grid grid-2" style="gap:9px"><div class="field"><label for="eventDate">Date</label><input id="eventDate" name="date" type="date" required value="${escapeHtml(existing?.date||"")}"></div><div class="field"><label for="eventTime">Start time</label><input id="eventTime" name="time" type="time" required value="${escapeHtml(existing?.time||"")}"></div></div><div class="field"><label for="eventVenue">Venue</label><input id="eventVenue" name="venue" required maxlength="90" value="${escapeHtml(existing?.venue||"")}" placeholder="Building, room or campus area"></div><div class="field"><label for="eventOrganizer">Organizer</label><input id="eventOrganizer" name="organizer" maxlength="80" value="${escapeHtml(existing?.organizer||"")}" placeholder="Club or department"></div><div class="field"><label for="eventAbout">Short description</label><textarea id="eventAbout" name="about" maxlength="260" placeholder="What will students experience?">${escapeHtml(existing?.about||"")}</textarea></div><div class="field"><label for="eventBenefits">Highlights (separate with commas)</label><input id="eventBenefits" name="benefits" value="${escapeHtml(existing?.benefits?.join(", ")||"")}" placeholder="Workshop, Q&A"></div><div class="form-actions"><button type="submit" class="btn btn-primary">${existing?"Save changes":"Add event"}</button>${existing?`<button type="button" class="btn" data-action="cancel-edit">Cancel</button>`:""}</div></form></section>
      <section class="panel panel-pad"><div class="section-heading"><div><h2>Event list</h2><p>${events.length} events currently in the prototype</p></div></div><div class="table-wrap"><table class="event-table"><thead><tr><th>Event</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>${sortedEvents().map(e=>`<tr><td><div class="table-event">${eventTile(e)}<span><strong>${escapeHtml(e.title)}</strong><small>${escapeHtml(e.category)} · ${escapeHtml(e.venue)}</small></span></div></td><td>${prettyDate(e)}</td><td><span class="status-pill ${e.status==="cancelled"?"cancelled":isPast(e)?"past":""}">${e.status==="cancelled"?"Cancelled":isPast(e)?"Past":"Upcoming"}</span></td><td><button class="btn" data-action="edit-event" data-id="${e.id}">Edit</button> <button class="row-action" title="Remove event" data-action="delete-event" data-id="${e.id}">×</button></td></tr>`).join("")}</tbody></table></div></section></div>`;
  }

  function renderSearchResults(query) {
    let box = document.getElementById("searchResults");
    if (!box) { box = document.createElement("section"); box.id = "searchResults"; box.className = "panel search-results"; root.prepend(box); }
    const q = query.toLowerCase();
    const hits = sortedEvents().filter(e => [e.title,e.category,e.venue,e.about,e.organizer].some(x=>String(x||"").toLowerCase().includes(q)));
    box.innerHTML = `<div class="section-heading"><div><h2>Search results</h2><p>${hits.length} matching event${hits.length===1?"":"s"}</p></div></div>${hits.length?`<div class="search-results-list">${hits.map(e=>`<button class="search-hit" data-action="view-event" data-id="${e.id}"><span><strong>${escapeHtml(e.title)}</strong><small>${escapeHtml(e.category)} · ${prettyDate(e)} · ${escapeHtml(e.venue)}</small></span><b>›</b></button>`).join("")}</div>`:`<p class="no-results">No matching events. Try a different search.</p>`}`;
  }

  function onClick(event) {
    const target = event.target.closest("[data-view],[data-filter],[data-select-event],[data-action],[data-category],[data-my-tab],[data-global-menu]");
    if (!target) return;
    if (target.matches("a[href='#']")) event.preventDefault();
    if (target.dataset.view) { event.preventDefault(); setView(target.dataset.view); closeMobileNav(); return; }
    if (target.dataset.globalMenu) {
      if (["Important Links","Quick Links"].includes(target.dataset.globalMenu)) {
        if (viewName() !== "dashboard") setView("dashboard");
        setTimeout(()=>document.getElementById("importantLinks")?.scrollIntoView({behavior:"smooth",block:"start"}), 80);
      } else showToast(`${target.dataset.globalMenu} navigation is shown for UMS context.`);
      return;
    }
    if (target.dataset.filter) { activeFilter = target.dataset.filter; render(); return; }
    if (target.dataset.selectEvent) { selectedEventId = target.dataset.selectEvent; render(); return; }
    if (target.dataset.myTab) { myEventsTab = target.dataset.myTab; render(); return; }
    if (target.dataset.category) { activeFilter = target.dataset.category; setView("dashboard"); return; }
    const action = target.dataset.action; const id = target.dataset.id;
    if (action === "toggle-sidebar") { document.getElementById("sidebar").classList.toggle("open"); document.querySelector(".mobile-overlay")?.classList.toggle("show"); return; }
    if (action === "open-events") { setView("my-events"); return; }
    if (action === "quick-links") { showToast("University service links are represented for context in this prototype."); return; }
    if (action === "quick-link") { showToast("University service links are outside the event discovery prototype."); return; }
    if (action === "register") { toggleRegistration(id); return; }
    if (action === "remind") { toggleReminder(id); return; }
    if (action === "view-event") { selectedEventId = id; activeFilter = "All Events"; setView("dashboard"); return; }
    if (action === "share") { const e = eventById(id); navigator.clipboard?.writeText(`${e?.title} — ${prettyDate(e)} at ${e?.venue}`).then(()=>showToast("Event details copied."),()=>showToast("Event details ready to share.")); return; }
    if (action === "mark-read") { updates = updates.map(u=>({...u,read:true})); write(STORAGE.updates,updates); showToast("All updates marked as read."); render(); return; }
    if (action === "cancel-edit") { editEventId = null; render(); return; }
    if (action === "edit-event") { editEventId = id; render(); root.scrollTo?.({top:0,behavior:"smooth"}); return; }
    if (action === "delete-event") { deleteEvent(id); return; }
  }
  function toggleRegistration(id) {
    const event = eventById(id); if (!event || event.status === "cancelled" || isPast(event)) return;
    if (registrations.includes(id)) { registrations = registrations.filter(x=>x!==id); reminders = reminders.filter(x=>x!==id); showToast("Registration removed from My Events."); }
    else { registrations.push(id); showToast("You're registered. This event is now in My Events."); }
    saveAll(); render();
  }
  function toggleReminder(id) {
    reminders = reminders.includes(id) ? reminders.filter(x=>x!==id) : [...reminders,id]; write(STORAGE.reminders,reminders);
    showToast(reminders.includes(id)?"Reminder turned on.":"Reminder turned off."); render();
  }
  function deleteEvent(id) {
    const event = eventById(id); if (!event) return;
    if (!confirm(`Remove “${event.title}” from this prototype?`)) return;
    events = events.filter(e=>e.id!==id); registrations = registrations.filter(x=>x!==id); reminders = reminders.filter(x=>x!==id); updates = updates.filter(x=>x.eventId!==id);
    editEventId = null; selectedEventId = events[0]?.id; saveAll(); showToast("Event removed from the prototype."); render();
  }

  document.addEventListener("click", onClick);
  window.addEventListener("hashchange", render);
  document.getElementById("globalSearch").addEventListener("input", e => { renderSearchResults(e.target.value.trim()); });
  document.getElementById("globalSearch").addEventListener("keydown", e => {
    if (e.key === "Escape") { e.currentTarget.value=""; document.getElementById("searchResults")?.remove(); }
    if (e.key === "Enter") { const hit=root.querySelector("[data-action='view-event']"); if (hit) hit.click(); }
  });
  document.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); document.getElementById("globalSearch").focus(); }
  });
  document.addEventListener("change", e => {
    if (e.target.matches("[data-interest]")) {
      const category=e.target.dataset.interest;
      interests=e.target.checked?[...new Set([...interests,category])]:interests.filter(x=>x!==category);
      write(STORAGE.interests,interests); render(); return;
    }
    if (e.target.matches("[data-event-reminder]")) { toggleReminder(e.target.dataset.eventReminder); return; }
    if (e.target.matches("[data-action='toggle-reminder-setting']")) { reminderOn=e.target.checked; write(STORAGE.reminderOn,reminderOn); render(); return; }
  });
  document.addEventListener("submit", e => {
    if (e.target.id !== "eventForm") return;
    e.preventDefault();
    const data=new FormData(e.target);
    const title=String(data.get("title")||"").trim();
    if (!title) return;
    const event={
      id: editEventId || `event-${Date.now()}`,
      title,
      category:String(data.get("category")||"Technical"),
      date:String(data.get("date")||""),
      time:String(data.get("time")||""),
      venue:String(data.get("venue")||"").trim(),
      organizer:String(data.get("organizer")||"").trim() || "Campus team",
      about:String(data.get("about")||"").trim() || "Event information will be updated soon.",
      benefits:String(data.get("benefits")||"").split(",").map(x=>x.trim()).filter(Boolean),
      icon: editEventId ? (eventById(editEventId)?.icon || "✦") : "✦",
      status:String(data.get("status")||"upcoming")==="cancelled"?"cancelled":"upcoming"
    };
    if (editEventId) { events=events.map(e=>e.id===editEventId?event:e); updateLog(event,"details updated"); showToast("Event details updated."); }
    else { events.push(event); updates.unshift({id:`update-${Date.now()}`,eventId:event.id,title:"New event added",text:`${event.title}: ${event.date} at ${event.time} · ${event.venue}.`,type:"New event",time:"Just now",read:false}); showToast("Event added to the prototype."); }
    selectedEventId=event.id; editEventId=null; saveAll(); render();
  });
  document.addEventListener("click", e => {
    if (e.target.classList.contains("mobile-overlay")) closeMobileNav();
  });
  function closeMobileNav() { document.getElementById("sidebar").classList.remove("open"); document.querySelector(".mobile-overlay")?.classList.remove("show"); }
  const overlay=document.createElement("div"); overlay.className="mobile-overlay"; document.body.append(overlay);
  render();
})();
