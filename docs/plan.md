# Office Talk: Development Plan (v4)

Nov 10, 2026 · @Fred

## What changed

v4 (10 Nov 2026, evening) settles pricing and storage on a Microsoft-style model, moves storage control to team managers and the IT team, adds free test companies, and brings back a full UK, EU and US compliance section. v3 (earlier the same day) made Office Talk a CV portfolio project with no real payments and no AI.

| Area | v3 | v4 |
| --- | --- | --- |
| Seat price | £29 base for 5 seats, £7 per extra seat | £7 per seat, minimum 3, no base fee; yearly billing 10% cheaper |
| Storage | One 100 GB company pool | Per seat: 10 GB personal + 10 GB project (split across their projects, or pinned to one); 10 GB company base; add +10 GB for £2 or +100 GB for £7 |
| Chats between people | Five tabs | Chat and Files only; Tasks, Calendar and Roadmap live in the private space and in project servers |
| Chat attachments | Not decided | Everything except text counts: private chats use the sender's personal storage, project channels use the project's; all saved in date order in a Chat folder |
| Who controls storage | Company admins | The person's team manager and the IT team, for both personal and project storage |
| Guests | Account guests and link guests | Link guests only, no accounts; 6 hours per visit; link works until the meeting ends |
| Minimum age | 18+ | 16+ |
| Free companies | None | Platform admin page: create free companies and accounts with a "free until" date, all features |
| Backups and downloads | Nightly backups | Nightly backup of changed files only, to S3 Glacier Deep Archive; files served through CloudFront |
| Compliance | Demo-only legal list | Full UK, EU and US section (section 11) |

How a developer or AI should use this plan:

1. Build in the phase order in section 8. Finish each phase's "done when" check before starting the next.
2. Do not add features outside the current phase.
3. Where the plan says **Decision needed**, stop and ask the owner instead of guessing.
4. When a wireframe and this plan disagree, this plan wins and the wireframe gets updated.

## 1. Vision and scope

Office Talk is a Discord-style collaboration website for businesses, built as a portfolio project to show on a CV. Each company gets a workspace. Each team or project is a server with its own text and voice/video channels, plus four top tabs: Chat, Files, Tasks and Calendar, Roadmap. It is built to the standard of a real product, but it will not take real payments or open to the public.

What makes it different from Discord:

- Servers are teams or projects inside a company, with business roles that an admin controls.
- Every server has a shared task list, calendar and visual roadmap. Every person also has a private space with their own files, tasks, calendar and goal roadmap.
- Direct messages have Chat and Files tabs, and every attachment is saved in order in a Chat folder.
- Files open and edit in the browser (Word, PowerPoint, Excel).
- Outside guests join a call from a link, with no account, for up to 6 hours per visit.
- Later: invoicing, time tracking and automatic emails.

Owner constraints:

- About 2 hours a week of owner time on the Claude Pro plan; Claude Code writes most of the code.
- About £15 a month for hosting, paid personally, since there is no revenue.
- Invite-only friends test it; the design must still scale to larger companies, because that is what the CV shows.
- GitHub, Claude Code and AWS are used for CV value.
- Everything runs on AWS (London region), except calls on LiveKit Cloud, edge protection on Cloudflare and test-mode billing on Stripe.

Out of scope for now: AI summaries (removed, may return later), real payments, CRM, payroll, HR, native mobile apps (the responsive site comes first) and call recording.

## 2. Users, roles and permissions

There are three layers: you as the platform owner, a company role, then a server role. The company's IT team are the company admins. Each team or project server has a manager. Managers and the IT team control storage and get the storage alerts for the people and projects they look after.

| Role | Layer | Can do |
| --- | --- | --- |
| Platform admin (you) | Whole site | Create free companies and accounts with a "free until" date, switch a company between free and paid, see platform health; MFA required, every action logged |
| Owner | Company (exactly one) | Everything the IT team can, plus billing, change plan, transfer ownership, delete the company |
| IT admin | Company | Add and remove users, create servers, set policies (retention, guest rules, MFA, login methods), assign storage anywhere, see the audit log, transfer and close leavers' accounts |
| Member | Company | Sign in, chats, own private space, join servers they are added to or that are open to everyone |
| Manager | One server (team or project) | Manage channels, members, roles and permission switches; get storage alerts for the project and for its members' personal storage; decide where the company's 10 GB and any extra storage go |
| Lead | One server | Create and assign tasks, edit the roadmap, schedule meetings (if the manager allows) |
| Server member | One server | Chat, use files, update their own tasks |
| Viewer | One server | Read-only |
| Guest | One call | No account. Joins a call from a link with a session name; each visit ends after 6 hours; the link stops working when the meeting ends |

A person's "team manager" for personal storage is the manager they report to on their contact card. If none is set, the alert goes to the IT team only.

### Free companies (platform admin)

- A hidden page at `/platform`, only for platform admins, protected by MFA and IP rate limits.
- **Create company:** name, owner email, seats, storage, and a **Free until** date picker (or "no end date").
- **Create accounts:** add users to any free company, or send invite links.
- **Switch plan:** turn an existing company free or back to paid. Free companies get every feature and never reach Stripe.
- When the date passes, the company becomes read-only and its owner is emailed. You can extend it with one click.
- Used for testing and for compliance checks, such as exports and takedown timers.

### When someone leaves the company

1. The person (or the IT team) removes their access. They can no longer sign in to this company.
2. Their account stays, frozen, with all its personal and chat files. The IT team and their manager can open it to see those files.
3. A frozen account still uses a paid seat until it is closed, and its storage still counts.
4. The IT team or manager presses **Transfer files and close**, picks another member, and the files move into that member's personal files in a folder named after the leaver.
5. The account closes and the seat is freed from the next bill. The audit log records who did it.

Personal files are private only while someone is a member. The "Only you can see this" label becomes "Private to you. If you leave, your manager and IT team can access these files." The privacy notice says the same.

### Permission switches (set per server by the server admin)

- Who can create or edit tasks, files, roadmap items and calendar events (admins only, leads, all members, or named people).
- Who can create channels, invite people and start calls.
- Whether members can edit or delete their own messages.
- Server visibility: invite only, or everyone in the company (from the wireframe's create-server form).

### Call rules (set per channel and per guest link)

- Guests allowed or not.
- Approval needed before a guest enters (waiting room), or not.
- Guest must enter a name, or the admin fixes the name.
- Optional call password.
- Guest links stop working when the meeting ends, and each guest visit is capped at 6 hours. The wireframe makes expiry optional; v4 makes it always on.

Rule for the developer: every request is checked by one central permission function, `can(user, company, server, action, resource)`. Never scatter permission checks through route handlers.

## 3. Screens and features

The wireframes cover 13 screens plus shared behaviour in `app.js`, `site.js`, `app.css` and `site.css`. Claude Code should rebuild them as React components, using the wireframes for layout and structure only. Their colours are not reused; the app has its own light and dark theme (section 6). The table lists what each screen must do and the gaps found in review.

| Screen (file) | What it does | Phase | Gaps to fix |
| --- | --- | --- | --- |
| Landing (`index.html`) | Hero, features, how it works, quote, footer | 5 | Placeholder copy; "portfolio demo" note; owner and contact details in the footer (section 11) |
| Pricing (`pricing.html`) | Three plans, monthly/yearly toggle, comparison table, FAQ | 5 | Rebuild as one plan: £7 per seat (min 3), storage add-ons, a seat and storage calculator, 14-day trial, "10% off yearly" toggle |
| Sign up (`signup.html`) | Name, work email, password meter, accept terms, Google/Microsoft | 1 | Add 16+ confirmation, breached-password check, email-verification screen |
| Sign in (`login.html`) | Email/password, remember me, reset flow, SSO | 1 | Add MFA code screen and "new device" email |
| Choose company (`create-company.html`) | Your companies, create company, join by invite | 1 | The "company address" field becomes the path slug (`yoursite.com/c/acme`) |
| Company home (`company.html`) | Stats, server cards, create server, invite people, upcoming meetings, online members | 1 | "Calls this week" stat needs call data from phase 4 |
| **Server (`server.html`)** | **Stub only** | 0 (design), 1–2 (build) | **The owner designs it in phase 0: channel list, the four top tabs, member list, project storage bar** |
| Messages (`messages.html`) | Chat between people, file sharing, Outlook-style contact card, pin/mute/mark unread | 1 | Cut the tabs to **Chat and Files**; Files shows a Chat folder with every attachment in date order; group chats, edit, delete, threads and reactions not shown yet |
| Personal files (`personal-files.html`) | Folders, upload, drag and drop, star, search, sort, link to a server, "share copy to server", storage bar | 3 | New privacy label (section 2); storage bar shows the person's own 10 GB (plus upgrades) |
| Personal tasks (`personal-tasks.html`) | Google Tasks-style lists, subtasks, stars, due dates, link to a server | 2 | Server tasks need assignee, priority and status |
| Personal calendar (`personal-calendar.html`) | Month view, event types, reminders, guest call link | 2 | Week and day views; time zones |
| Personal roadmap (`personal-roadmap.html`) | Goals × months, milestones with tasks, auto status, today line | 2 | Server roadmap needs dependencies and drag to change dates |
| Call (`call.html`) | Grid/speaker view, screen share, raise hand, reactions, in-call chat, waiting room, invite modal with password | 4 | Hide the record button; show a 6-hour countdown on guest tiles; end guest links when the meeting ends |
| Pre-join (`join.html`) | Camera preview, name, mic/camera pick, password | 4 | Use it for members too; mic and camera start **off**; CAPTCHA for guests |
| Settings (`settings.html`) | Profile, status, password, notifications, members and roles, invites and guest links, company, plan, danger zone | 1 | Add security (MFA, devices), data export, privacy complaint form, audit log, retention, frozen members with "Transfer files and close", and a **Storage** tab for managers and IT |
| App-wide (`app.js`) | Ctrl+K switcher, in-app tab strip, right-click "open in new tab", status card, switch accounts | 1 (switcher, status), 6 (tabs, switch accounts) | Keep the right-click menu, but check testers like it |

Screens not yet wireframed, needed before their phase: the server view, phone layouts, the **platform admin page** (`/platform`), the **storage settings** for managers and IT (allocations, split or pin, add-ons, alerts), company admin (audit log, retention, MFA policy), notifications inbox, search results, report and takedown forms with the moderation queue, privacy complaint form, and the trial and checkout screens.

## 4. Pricing and plans

There is one plan with every feature: £7 per seat, at least 3 seats, and storage on a Microsoft 365-style model with personal and project storage. Billing runs in Stripe test mode, so no real money changes hands, but the numbers are worked out as if it were real.

| Item | Price (excl. VAT) | Notes |
| --- | --- | --- |
| Seat | £7/month, or £6.30/month billed yearly (£75.60 a year, 10% off) | Minimum 3 seats (£21/month); no base fee |
| Included with each seat | — | 10 GB personal storage + 10 GB project storage |
| Company base | Included | 10 GB, given to any project by a manager or the IT team |
| Extra storage | +10 GB for £2/month, or +100 GB for £7/month | As many as needed; a manager or the IT team assigns each to a person or a project |
| Text, servers and channels | Free, unlimited | Only attachments use storage |
| Guests | Free | No account; 6 hours per visit |
| Free trial | 14 days | Then read-only until a (test) card is added |
| Free companies | £0 until a date the platform admin sets | Every feature; never billed |

### How storage works

- **Personal (like OneDrive):** 10 GB each. It holds the person's private files and everything they send in chats between people: photos, videos and documents. Text never counts.
- **Project (like SharePoint):** each person brings 10 GB, split evenly across the projects they're in. In 2 projects, each gets 5 GB. They can pin all 10 GB to one project instead. A project's total is its members' shares plus any company base or extra storage given to it. Everything except text sent in its channels counts.
- **Chat folder:** every attachment sent in a chat or channel also appears, in date order, in a **Chat** folder in that chat's or project's Files tab. It's the same file, so it's only counted once.
- **Versions and recycle bin count.** Keep the last 25 versions; empty the recycle bin after 30 days.
- **Over the limit:** nothing is deleted. New uploads are blocked, and the team manager and IT team are alerted at 80% and 100%.
- **Moving people:** when someone leaves a project, their share leaves too. If that puts the project over its limit, the same rule applies.

**Example:** Acme has 3 seats (£21/month). Ali is in Website and App, so each gets 5 GB. Ben pins his 10 GB to Website. Cara is only in App, so App gets her 10 GB. IT gives the company's 10 GB to App. Website has 15 GB, App has 25 GB, and each person has 10 GB of personal storage.

### Cost check

S3 Standard in London costs $0.024 per GB a month, about 1.8p ([AWS rates by region](https://costgoat.com/pricing/amazon-s3)). The nightly backup of changed files in Glacier Deep Archive costs $0.0018 per GB, about 0.14p. AWS charges for storage actually used, not storage sold, and most people fill only part of their allowance.

| Item | Price | Cost to you if completely full | Margin |
| --- | --- | --- | --- |
| Seat storage (20 GB) | Part of £7 | About 39p | — |
| Seat calls, average (10 hrs, 2 people) | Part of £7 | £0.90–1.80 on LiveKit's paid plan | Seat overall: about 70–80% |
| +10 GB | £2 | About 19p | About 90% |
| +100 GB | £7 | About £1.94 | About 72% |

The +100 GB pack is much better value per GB (7p) than ten +10 GB packs (20p). That's normal and nudges customers to the bigger pack.

Call cost assumption (not measured): one received camera stream uses 0.25 to 0.75 GB an hour. LiveKit's paid plan charges $0.0005 per participant-minute and $0.12 per GB after its allowance ([LiveKit pricing](https://livekit.com/pricing.md)). A heavy seat (40 hrs, 3 people, cameras on) could cost £8–19 a month. Cameras off on join and adaptive streaming keep most seats well below that. The demo stays on the free plan, and `usage_records` logs real minutes and GB for the README write-up.

Downloads are the hidden cost: S3 charges about $0.09 per GB sent out. Files are served through CloudFront, which includes 1 TB of free data out a month.

### How it compares

| Product | UK price per user/month (annual) | Storage |
| --- | --- | --- |
| Microsoft Teams Essentials | £3.10 | 10 GB per user |
| Microsoft 365 Business Basic | £5.40 | 1 TB per user |
| Slack Pro | £5.75 | — |
| Google Workspace Business Starter | £5.90 | 30 GB per user, pooled |
| **Office Talk** | **£6.30** | **10 GB personal + 10 GB project** |

Office Talk costs a little more than Slack or Google Starter and has less storage than Microsoft. The pricing page should lead with what it replaces: a chat app *and* a separate task and roadmap tool, with free guests and unlimited video. Sources: [Microsoft Teams UK prices](https://www.microsoft.com/en-gb/microsoft-teams/free-classic-retirement), [Microsoft 365 UK prices](https://www.microsoft.com/en-gb/microsoft-teams/compare-microsoft-teams-business-options-b), [Slack UK pricing](https://www.salesforce.com/uk/slack/pricing/?bc=DB), [Google Workspace UK prices](https://www.comparethecloud.net/articles/google-workspace-vs-microsoft-365-business-uk-startup-5-20-staff-all-in-gbp-costs).

### VAT

Prices show "+ VAT". A VAT-registered UK seller charges UK VAT to UK customers, businesses included, and businesses reclaim it. Business customers outside the UK with a VAT number pay no UK VAT (reverse charge). Consumers see the VAT-inclusive total at checkout. In test mode this is demonstrated with Stripe Tax; Office Talk itself is not VAT-registered.

### Fair-use limits

These keep "unlimited video" safe. The backend enforces them, not the browser.

- Maximum call length 12 hours; guests removed after 6 hours per visit.
- Idle calls end after 2 hours with one person, or no audio or video activity.
- Up to 25 participants per call.
- 720p maximum, adaptive streaming, audio-only fallback on poor connections.
- No recording or transcription.

### How billing is built (test mode)

- One Stripe subscription per company: a seat quantity (minimum 3), plus quantities of two storage products (+10 GB and +100 GB), monthly or yearly prices, and a 14-day trial.
- Stripe Checkout and the customer portal handle cards, so card data never touches your servers.
- Seat count updates when someone is added or a frozen account is closed (prorated).
- Free companies made by the platform admin skip Stripe entirely until their "free until" date.
- Everything uses Stripe's test keys and test cards. A banner on every page says "Portfolio demo: no real payments".

## 5. Voice and video: use LiveKit

Use LiveKit: LiveKit Cloud's free Build plan (5,000 participant-minutes and 50 GB a month), with the open-source LiveKit server in Docker for local development. For an invite-only demo, the free plan should be enough on its own; the paid Ship plan matters only if Office Talk ever became a real product. Because the same code runs on both, hosting can move to a self-hosted LiveKit server on AWS without rewriting the call features.

| Option | Price | Heavy seat (40 hrs, 3 people) | For | Against |
| --- | --- | --- | --- | --- |
| **LiveKit Cloud** (chosen) | Free Build plan: 5,000 min, 50 GB. Ship $50/mo: 150,000 min, then $0.0005/min; 250 GB, then $0.12/GB | $10.80–25.20 | Ready-made React call components, guest tokens, waiting rooms; free for friend testing; open source, so no lock-in | Bandwidth is metered; not an AWS service |
| Self-hosted LiveKit on AWS | EC2 server + AWS data out at $0.09/GB after 100 GB free | $5.40–16.20 + server share | Same code, all on AWS (good for CV), cheaper per GB | You run, patch and scale a media server; needs a well-connected EC2 and UDP ports |
| Amazon Chime SDK | $0.0017 per attendee-minute, standard quality up to 720p | About $12.20 | AWS-native, simple per-minute bill | 3.4x LiveKit's minute rate; no free tier listed; no self-host option; fewer ready-made UI parts |
| Cloudflare Realtime SFU | 1,000 GB free a month, then $0.05/GB | $3–9 | Cheapest bandwidth | Lower-level: you build rooms, waiting rooms and UI yourself; more code for Claude to get right |

Why LiveKit and not Chime: Chime's page lists one rate per attendee-minute and does not say whether meeting bandwidth is extra. For very heavy video it could be cheaper. But it has no free tier for testing, no way to self-host, and more call UI to build by hand. LiveKit keeps the backend design from v1 unchanged: the FastAPI backend creates short-lived room tokens, including one-room guest tokens.

When to revisit: if testing ever runs past the free plan's 5,000 minutes or 50 GB in a month, price a small self-hosted LiveKit server on AWS against the Ship plan. The switch is a config change (server URL and API keys), not a rewrite.

How joining a call works, for members and guests:

1. The person opens the call and lands on the pre-join screen (`join.html`). Mic and camera start **off**, with a camera preview and device pickers, like Zoom.
2. They switch mic or camera on if they want, type a name (guests), and press Join.
3. The backend checks `can(user, …, "call.join")`, or the guest link's token and password, and that the meeting hasn't ended.
4. If approval is on, the guest waits in the lobby until a member admits them.
5. The backend signs a LiveKit token for one room with the display name set. A guest's token lasts 6 hours from when they join; rejoining starts a new visit while the meeting is still running.
6. The browser connects straight to LiveKit with that token, publishing only the tracks that were switched on. Media never passes through the backend.
7. LiveKit webhooks tell the backend when people join and leave. The backend stores `call_sessions` and `usage_records`, and ends calls or removes guests that break the limits.

Sources: [LiveKit Cloud pricing](https://livekit.com/pricing.md), [Amazon Chime SDK pricing](https://aws.amazon.com/chime/chime-sdk/pricing/), [Cloudflare Realtime pricing](https://developers.cloudflare.com/realtime/sfu/pricing), [AWS data transfer rates](https://costgoat.com/pricing/aws-data-transfer). Amazon retired the Chime meetings app on 20 Feb 2026; the Chime SDK continues ([innFactory](https://innfactory.de/en/cloud/aws/products/chime-sdk/)).

## 6. Architecture and tech stack

Start as one Python backend (a modular monolith) on AWS, with managed services for calls, payments, files and email. Split it into separate services only if scale demands it.

```text
Browser (React app)
  -> Cloudflare (DNS, firewall, CAPTCHA)
    -> FastAPI backend on AWS EC2, London (REST, WebSockets, can() checks)
         -> PostgreSQL (all app data)
         -> Redis + arq workers (live events, jobs) -> SES (email), Glacier Deep Archive (nightly backups)
         -> S3 files, served to browsers through CloudFront signed URLs
         -> OnlyOffice server (Office editing, phase 3)
         -> LiveKit Cloud (signs room tokens; browser sends audio/video straight to LiveKit)
         -> Stripe (test-mode seat and storage billing)
```

Every request passes Cloudflare and the FastAPI backend; only call media and file downloads (through signed S3 links) skip it.

| Layer | Choice | Why |
| --- | --- | --- |
| Backend API | Python 3.12, FastAPI, SQLAlchemy 2, Alembic migrations, Pydantic | Python as requested; async and WebSockets built in; auto OpenAPI spec |
| Database | PostgreSQL 16 | Relational, reliable, built-in full-text search for chat and files |
| Cache and jobs | Redis, with arq workers | Presence, live message fan-out, rate limits, email, guest expiry and cleanup jobs |
| Frontend | React, TypeScript, Vite, Tailwind CSS (colours mapped to the CSS variables in `frontend/src/theme.css`: one light set, one dark set, switched by `data-theme` on `<html>`, defaulting to `prefers-color-scheme`), TanStack Query | Best fit for a live, Discord-like interface; Claude Code writes it well |
| Live updates | One WebSocket per browser tab from FastAPI | Messages, typing, presence, task and roadmap changes |
| Voice and video | LiveKit Cloud free plan + `@livekit/components-react`; LiveKit server in Docker for development | Section 5 |
| Office editing | OnlyOffice Document Server (self-hosted, phase 3) | Word, PowerPoint and Excel in the browser |
| File storage | AWS S3, private buckets, served through CloudFront signed URLs; nightly backup of changed files to Glacier Deep Archive (MinIO locally) | Cheap, durable, versioning built in |
| Email | AWS SES, through one queue | Cheap transactional email |
| Payments | Stripe Billing in test mode, Checkout and customer portal | Seats, storage and trial (section 4) |
| Edge | Cloudflare (DNS, DDoS protection, firewall, Turnstile CAPTCHA) | Free plan covers it |
| Infrastructure as code | Terraform | Whole AWS setup rebuildable from the repo; strong CV skill |
| Packaging | Docker Compose, Caddy reverse proxy | One command runs everything; automatic HTTPS |
| Delivery | GitHub, GitHub Actions (lint, test, build, deploy) | CV value and automatic releases |
| Monitoring | Sentry (errors), UptimeRobot or CloudWatch (uptime, alarms) | Know about problems before testers do |

Three design rules:

- Multi-tenant from day one: every table that holds company data has a `company_id`, and every query filters on it.
- Providers behind interfaces: calls (`CallProvider`), email (`Mailer`), storage (`Storage`) and billing (`Billing`) each sit behind a small class, so swapping a provider touches one file.
- Leave room for AI: summaries are out for now, but messages and files keep the timestamps and read markers a future "Catch me up" feature would need.

## 7. Data model

Every table except `users` carries a `company_id`. Use UUID primary keys and `created_at`/`updated_at` everywhere. Tasks, events, files and roadmap items share one scope pattern: `scope` = server, dm or personal, plus the matching id. That lets the same task code serve server tabs, chat files and the private space.

| Table | Key fields | Notes |
| --- | --- | --- |
| companies | name, slug (the `/c/slug` path), industry, size band, logo colour, plan (paid, trial, free), free\_until, settings (retention, guest policy, MFA rule) | Free companies are created by the platform admin |
| subscriptions | company, Stripe ids (test mode), seats (min 3), +10 GB packs, +100 GB packs, monthly or yearly, trial ends, status | Phase 5 |
| platform\_admins | user, granted\_by, MFA required | Only you at first; every action in `audit_log` |
| users | email, name, password hash or SSO id, avatar, MFA secret, status, custom status, date of birth confirmed 16+ | A user can belong to several companies |
| company\_members | company, user, role (owner, IT admin, member), state (active, frozen, closed), job title, department, phone, location, time zone, pronouns, bio, skills, manager (reports to) | Manager gets personal-storage alerts |
| servers | company, name, type (team or project), visibility, icon, colour, storage limit (worked out) | Discord-style server |
| server\_members | server, user, role (manager, lead, member, viewer), custom permissions | Managers control project storage |
| storage\_allocations | user, server, GB, pinned (yes/no) | A person's 10 GB split across projects, or pinned to one |
| storage\_grants | company, source (company base, +10 GB pack, +100 GB pack), GB, assigned to a user or a server, assigned by | Managers and IT decide where extra storage goes |
| usage\_records | company, kind (call minutes, call GB, storage GB), amount, period | Fair-use checks and the README cost write-up |
| channels | server, name, type (text, voice, video), guest policy, position | Guest policy set per channel |
| messages | channel or chat, author, body, parent (thread), edited, deleted | Full-text index for search |
| reactions, mentions | message, user, emoji or mentioned user | Drive notifications |
| dm\_conversations, dm\_members | members, is\_group; per member: pinned, muted, last\_read | Chat and Files tabs only |
| files, file\_versions, file\_stars | scope (personal, chat, server) + id, folder, name, S3 key, size, version, uploader, owner, source message, image hash; stars per user | Chat attachments link to their message and appear in the Chat folder; counted once |
| folders | scope + id, name, parent, is\_chat\_folder | The Chat folder is created automatically |
| task\_lists, tasks | scope (personal or server) + id, title, notes, assignee, due, status, priority, parent, roadmap item | No tasks in chats between people |
| calendar\_events, event\_attendees | scope (personal or server) + id, title, kind, start, end, call link, reminder | Feeds every calendar view |
| goals, roadmap\_items | scope (personal or server) + id, lane, title, start, end, status, depends\_on | Progress from linked tasks |
| call\_sessions, guest\_links | channel or event, room id, link token hash, ends with meeting, password hash, require name, require approval; per visit: started, ends at +6 hours | Guests have no accounts |
| notifications | user, type, link, read | In-app first; email in phase 6 |
| reports, moderation\_actions | reporter, target, reason, law (OSA, DSA, DMCA, TAKE IT DOWN), received at, deadline, decision, statement of reasons, decided by | One queue for every kind of report (section 11) |
| privacy\_requests | user, type (access, export, delete, correct, complaint), received at, acknowledged at, closed at | DUAA complaints duty and data rights |
| user\_sessions | user, device, IP country, last seen, revoked | Device list and sign out everywhere |
| audit\_log | actor, action, target, time | Admin and platform actions, guest entries, file access, transfers and closures |
| invoices, invoice\_items, time\_entries | company, client, number, due, status, totals; user, task, start, duration | Phase 6 |

Personal views are queries, not copies. "My tasks" is every task assigned to the user across their servers, plus their personal lists. "My calendar" works the same way.

Assumption, kept from v1: a task can belong to a roadmap item, a roadmap item shows its progress from its tasks, and task due dates appear on calendars. The personal roadmap wireframe already behaves this way.

## 8. Phased build plan

There are seven phases, about 63 weeks at 2 hours a week, with Claude Code writing most of the code. Starting mid-November 2026, friend testing begins around May 2027 (week 27) and the portfolio is complete around November 2027 (week 51); phase 6 is optional extras. v4 adds about 3 weeks for the storage model, the platform admin page and the compliance work. These estimates are rough; re-plan after phase 1 using real speed.

| Phase | Weeks | Starts week | Ends week |
| --- | --- | --- | --- |
| 0. Foundations | 4 | 0 | 4 |
| 1. Accounts, chat, safety | 13 | 4 | 17 |
| 2. Tasks and roadmap | 10 | 17 | 27 (friend testing starts) |
| 3. Files and storage | 9 | 27 | 36 |
| 4. Calls and guests | 8 | 36 | 44 |
| 5. Billing, compliance | 7 | 44 | 51 (portfolio complete) |
| 6. Business extras (optional) | 12 | 51 | 63 |

Phase 1 is the longest, at 13 weeks, because accounts, permissions, live chat, reporting and the platform admin page underpin everything after it. The repo is already worth showing on a CV once phase 1 is done.

### Phase 0: Foundations (about 4 weeks)

- [ ] Owner designs the missing server view (channel list, four top tabs, member list, storage bar) as `server.html`
- [ ] Owner adds phone layouts for chats, server chat, tasks and calendar
- [ ] Move the approved wireframes into `docs/wireframes/`; create `docs/compliance/`
- [x] Create the GitHub repo with `backend/`, `frontend/`, `infra/`, `docs/`
- [ ] Write `CLAUDE.md`, `README.md` and `docs/plan.md` (this plan)
- [ ] Docker Compose: FastAPI, Postgres, Redis, Caddy, MinIO, LiveKit server
- [ ] GitHub Actions: lint, type check, test, build, accessibility checks; Dependabot, pip-audit, npm audit, secret scanning
- [ ] Terraform for one small EC2 instance in eu-west-2, S3, CloudFront, SES, and an AWS budget alert at £12 and £15
- [ ] Run the ICO fee self-assessment; deploy an empty "hello" app behind Cloudflare

Done when: pushing to `main` deploys automatically, the live site loads over HTTPS, and the server wireframe is done.

### Phase 1: Accounts, companies, chat and safety (about 13 weeks)

- [ ] Sign up with 16+ confirmation, email verification, sign in, password reset, Google and Microsoft sign-in
- [ ] MFA (authenticator app and passkeys), required for owners, IT admins and platform admins; device list; rate limits and Turnstile
- [ ] Choose, create and join company; `/c/slug` paths; company home; invites
- [ ] Roles: owner, IT admin, member; server manager, lead, member, viewer; the central `can()` function and cross-company tests
- [ ] Platform admin page (`/platform`): create free companies and accounts, "free until" date picker, switch free or paid
- [ ] Servers, channels, messages over WebSockets: send, edit, delete, threads, @mentions, reactions, attachments
- [ ] Chats between people and group chats with Chat and Files tabs, pin, mute and unread
- [ ] Search, in-app notifications, status and custom status, contact card with "reports to", Ctrl+K switcher
- [ ] Settings: profile, notifications, members and roles, company; removing a member freezes their account
- [ ] Report button on every message and file; takedown forms (illegal content, copyright, intimate images); one moderation queue with deadlines, a 48-hour timer for intimate-image requests, and statements of reasons
- [ ] Privacy tools: export my data, delete my account, privacy complaint form with 30-day acknowledgement; essential cookies only
- [ ] Under-18 accounts get private-by-default settings (Children's Code); Terms acceptance recorded with version and time; "authority order" items in the moderation queue with a 1-hour alert (EU terrorist content); locked evidence store with 1-year retention for NCMEC and NCA reports; written law enforcement request process

Done when: three friends in one company can chat live, a platform admin can create a free company with an end date, a test takedown request is handled inside 48 hours, and automated tests prove a non-member cannot read a private server or another company's data.

### Phase 2: Tasks, calendar and roadmap (about 10 weeks)

- [ ] Server tabs: Chat, Files (placeholder), Tasks and Calendar, Roadmap
- [ ] Task lists and tasks with assignee, due date, status, priority, subtasks, stars, comments
- [ ] Personal tasks, calendar and goal roadmap (as wireframed); "My tasks" and "My calendar" across everything
- [ ] Server calendar with meeting, focus, task-due and milestone events, and reminders
- [ ] Server roadmap with drag to change dates and dependencies; progress from linked tasks
- [ ] Permission switches for who can add or edit tasks, events and roadmap items
- [ ] Installable web app (home-screen icon) and nightly database backups with a tested restore

Done when: a manager can restrict editing, each person sees only their own assignments in personal views, and a restore from backup works. Friend testing starts here.

### Phase 3: Files, storage and Office editing (about 9 weeks)

- [ ] Upload to S3, served through CloudFront signed URLs; folders, previews, version history (last 25), recycle bin (30 days), stars, search
- [ ] Personal storage (10 GB each) and project storage (each person's 10 GB split across projects, or pinned to one)
- [ ] Company base 10 GB and storage grants, assigned by managers or IT; Storage tab in Settings
- [ ] Chat and channel attachments count against the right storage and appear in an automatic Chat folder in date order
- [ ] Alerts at 80% and 100% to the team manager and IT; uploads blocked when full, nothing deleted
- [ ] "Transfer files and close" for frozen accounts; new privacy label on personal files
- [ ] File type allow-list, real content-type check, size limits, malware scan; image hashes to find identical copies for takedowns
- [ ] Nightly backup of changed files to Glacier Deep Archive, with a test restore
- [ ] Self-host OnlyOffice; signed links and save callbacks

Done when: two members edit the same Word file in the browser, a person in two projects gives each 5 GB, an over-limit upload is refused with alerts sent, and a deleted file is restored from the archive.

### Phase 4: Voice, video and guests (about 8 weeks)

- [ ] LiveKit Cloud project (free Build plan); `CallProvider` interface; token endpoint
- [ ] Pre-join screen for everyone: preview, device pickers, mic and camera off by default
- [ ] Voice and video channels, calls in chats, grid and speaker view, screen share, raise hand, reactions, in-call chat
- [ ] Scheduled meetings that create calendar events with a join link
- [ ] Guest links without accounts: session name, optional password, waiting room, admit, deny and remove; each visit ends after 6 hours; the link stops when the meeting ends
- [ ] LiveKit webhooks into `call_sessions` and `usage_records`; fair-use limits enforced
- [ ] Hide the record button; show a notice when a call starts

Done when: an outsider joins from a link with mic and camera off, cannot reach anything else, is removed after 6 hours, cannot rejoin after the meeting ends, and the call's minutes and GB appear in `usage_records`.

### Phase 5: Billing demo, compliance and polish (about 7 weeks)

- [ ] Stripe test mode: seats (minimum 3), +10 GB and +100 GB packs, monthly or yearly (10% off), 14-day trial, Checkout, portal, webhooks, seat sync
- [ ] New pricing page with a seat and storage calculator and "+ VAT" prices
- [ ] Company-wide export (JSON plus original files) for the EU Data Act; no exit fees
- [ ] Finish the compliance pack in `docs/compliance/` (section 11); Terms, privacy notice, accessibility statement
- [ ] Landing page copy, owner and contact details, "Portfolio demo: no real payments" banner
- [ ] Load test (k6 or Locust), OWASP ZAP scan, accessibility audit; fix what they find
- [ ] README with screenshots, the architecture diagram, real cost numbers, the compliance pack, and a 2-minute demo video

Done when: a test company can start a trial, add a fourth seat and a +10 GB pack with a Stripe test card, export all its data, and the README and demo video are public. The portfolio is complete here.

### Phase 6: Business extras, optional (about 12 weeks)

- [ ] Email service: digests, reminders, task and meeting emails (with unsubscribe for anything non-transactional)
- [ ] Invoices for clients and internal expenses; statuses, reminders, PDF export
- [ ] Time tracking linked to tasks and invoices
- [ ] In-app tab strip and switch accounts (from the wireframe)

Done when: a company can track time on a task, invoice a client and have the invoice emailed.

## 9. How to build it with Claude Code

Treat Claude Code as the developer and yourself as the product owner and reviewer. Each 2-hour week is about 1 or 2 small tasks, and every task follows the same loop: issue, plan, code with tests, review, pull request, merge. You do not need to write the code, but you do need to read each plan, run the app, and understand what was built well enough to explain it in an interview.

### One-time setup (phase 0)

1. Install Claude Code and sign in with a paid Claude plan. Install Git, Docker Desktop, Node.js, Python 3.12 and the GitHub CLI (`gh`).
2. Create the repo on GitHub, clone it, and copy in `docs/plan.md` (this plan) and `docs/wireframes/` (the HTML files, not screenshots). Claude can read HTML and CSS directly and turn them into React components.
3. Run `/init` inside Claude Code to draft `CLAUDE.md`, then edit it to hold the rules below.
4. Ask Claude to turn each phase's checklist into GitHub issues with `gh`, sized at 1 to 2 hours each, labelled by phase.
5. Install the Claude GitHub app so you can tag `@claude` on a pull request for a review.

### What goes in CLAUDE.md

```markdown
# Project rules
- Read docs/plan.md before starting. Work only on the issue named in the prompt.
- Stack: FastAPI + SQLAlchemy 2 + Alembic; React + TS + Vite + Tailwind; Postgres; Redis/arq.
- Run `make test` and `make lint` before saying a task is done. Never skip failing tests.
- Every permission check goes through backend/app/permissions.py `can()`.
- Every query on company data filters on company_id. Add a cross-company test for each new endpoint.
- Database changes only through Alembic migrations.
- Calls, email, storage and billing only through their interface classes.
- Never put secrets in the repo; use .env (git-ignored) and AWS Secrets Manager.
- UI layout and structure follow docs/wireframes/*.html; never copy wireframe colours.
- All colours are CSS variables in frontend/src/theme.css (light and dark sets, data-theme on <html>, default prefers-color-scheme). Never hard-code colours in components.
- If the plan says "Decision needed", stop and ask.
- One feature per branch and pull request. Keep diffs under about 400 lines.
```

### The loop for every task

1. **New session, new branch.** Start Claude Code fresh for each issue so it doesn't carry old context.
2. **Plan first.** Switch to plan mode and paste: *"Read CLAUDE.md, docs/plan.md section 8 phase 1, and docs/wireframes/messages.html. Plan issue #12 (DM pin and mute). List the files you will change, the migration, the endpoints, and the tests. Do not write code yet."*
3. **Check the plan.** Look for anything outside the issue, missing tests, or a permission check outside `can()`. Ask it to fix the plan before approving.
4. **Build.** Let it write the code and tests and run them. If something fails twice, ask it to explain the cause before it tries again.
5. **Try it yourself.** Run `docker compose up` and click through the feature in the browser, including on a phone-sized window.
6. **Review with fresh eyes.** Open a second session and ask: *"Review the diff on this branch against CLAUDE.md and the security table in plan section 11. List problems only."* On GitHub, tag `@claude` on the pull request for a second review.
7. **Merge.** CI must pass. Squash-merge, close the issue, and ask Claude to tick the item in `docs/plan.md`.
8. **Learn it.** End with: *"Explain what you built in this PR as if I'm being interviewed about it."* Save the answer in `docs/learning-log.md`.

### Habits that keep it safe

- Keep `docs/decisions.md`: one line per decision with the date, so future sessions know why things are the way they are.
- Add a rule to `CLAUDE.md` every time you correct Claude on the same mistake twice.
- Let tests guard what you can't read line by line: permission tests, cross-company tests, and Playwright end-to-end tests of sign-in, chat, tasks and calls.
- Never paste real customer data or secrets into a prompt.
- Commit often; if a session goes wrong, `git reset` to the last good commit and start a new session instead of untangling it.
- At the end of each phase, ask Claude for a short phase report: what was built, what's left, what slowed it down. Use it to re-plan.

### Working within the Pro plan

The Pro plan includes Claude Code, with usage limits that reset over time. At 2 hours a week, the limits matter more than the clock, so spend them on code, not on re-reading context. Check Anthropic's support pages for the current limits.

- One issue per session, and clear the conversation between tasks so old context isn't re-sent.
- Keep `CLAUDE.md` short and point Claude at exact files ("read `backend/app/permissions.py`") instead of asking it to explore the repo.
- Use plan mode for the thinking, then let it build in one go; small, clear issues use far less than vague ones.
- Run the app and click through it yourself rather than asking Claude to check by hand.
- If you hit the limit mid-task, commit what works, write a two-line note in the issue, and pick it up next session.
- If you later move to a bigger plan, nothing in this workflow changes; you just finish more issues per week.

## 10. Hosting and budget

With AI removed, calls on LiveKit's free plan and Stripe in test mode, Office Talk can stay close to £15 a month for the whole build. The one exception is OnlyOffice, which needs its own larger server: run it only when someone is testing or demoing. Every AWS figure is a rough estimate; check the AWS pricing calculator before committing.

| Phase | What runs | Extra per month |
| --- | --- | --- |
| 0–2 | One small EC2 instance (about 2 GB RAM) with FastAPI, Postgres, Redis, Caddy and the frontend, in eu-west-2 | £10–13 |
| 2–3 | S3 for files (about 1.8p per GB), SES for email | Under £2 at friend scale |
| 3 | CloudFront in front of S3; first 1 TB a month of data out is free | £0 at friend scale |
| 3 | Nightly backup of changed files to Glacier Deep Archive (about 0.14p per GB) | Pennies |
| 3 | OnlyOffice on its own server with 4 GB RAM or more | £15–30 if always on; a few pounds if started only for test and demo sessions |
| 4 | LiveKit Cloud Build plan: 5,000 participant-minutes and 50 GB a month | £0 |
| 5 | Stripe in test mode | £0 |
| Always | Domain name; Cloudflare free plan; Sentry free plan | About £1 |

Not in the AWS budget: the Claude Pro plan.

**Decision needed before phase 3:** how to run OnlyOffice. Suggested: a Terraform-managed instance that a GitHub Actions button starts and an evening schedule stops, so it costs nothing while idle.

## 11. Compliance: UK, EU and US internet laws

This is the full register of UK, EU and US laws that apply to Office Talk as of November 2026: long-standing laws and those that started this year. It also lists laws checked and found not to apply, and laws that start soon. Office Talk is built as if it were a real UK company serving all three regions, so this register is part of the portfolio. Free test companies from the platform admin page are used to run the checks, such as a full export or a takedown timer. This is not legal advice; a real launch needs a solicitor's review.

**The 16+ decision matters.** UK and US law treat anyone under 18 as a child for some rules, so allowing 16- and 17-year-olds brings in the UK Children's Code and the Online Safety Act's children's duties. 16+ is still above the UK's age of consent for online services (13), at the top of the EU's 13–16 range, and above the COPPA line (under 13).

"Demo" says whether the law applies while Office Talk is an invite-only portfolio project: **Yes**, **Light** (some duties only), or **Launch** (only if it opens to the public or takes money).

### United Kingdom: data and privacy

| Law (year) | What it requires | How Office Talk meets it | Demo | Phase |
| --- | --- | --- | --- | --- |
| UK GDPR and Data Protection Act 2018 | Lawful basis, privacy notice, data minimisation, access, correction, deletion and export rights, security, 72-hour breach reporting, records of processing, processor contracts, DPIA for higher-risk processing | Privacy notice; self-service export and delete; data in London; records of processing; DPIA; breach plan; sub-processor list | Yes | 1, 5 |
| Data (Use and Access) Act 2025 | Amends UK GDPR, DPA and PECR; most changes in force since 5 Feb 2026; data protection complaints procedure since 19 June 2026 (acknowledge within 30 days, tell people about the ICO) | Privacy complaint form, automatic acknowledgement, complaints log | Yes | 1 |
| Privacy and Electronic Communications Regulations 2003 (PECR) | Consent for non-essential cookies (some low-risk analytics now exempt) and for marketing email; fines now match UK GDPR | Essential cookies only; marketing email only with opt-in | Yes | 1 |
| Age Appropriate Design Code (Children's Code, 2021) | Services likely to be used by under-18s: high-privacy defaults, no nudging, profiling and location off by default, a children's DPIA | Under-18 accounts get private-by-default settings; no tracking or profiling for anyone | Yes (16–17s can join) | 1 |
| ICO data protection fee (Data Protection (Charges and Information) Regulations 2018) | Yearly fee unless exempt | Run the ICO's fee self-assessment | Light | 0 |

### United Kingdom: online content and safety

| Law (year) | What it requires | How Office Talk meets it | Demo | Phase |
| --- | --- | --- | --- | --- |
| Online Safety Act 2023 | User-to-user services: written illegal content risk assessment, Ofcom code measures, reporting and complaints, a named accountable person; children's access assessment and, if children can use it, children's risk assessment and protections; report child sexual exploitation and abuse content to the NCA | Report button on every message and file; one moderation queue; complaints; written assessments in `docs/compliance/`; owner named as accountable person; NCA escalation path | Light: check whether private workspaces are in scope | 1, 5 |
| Electronic Commerce (EC Directive) Regulations 2002 | Show who runs the service and how to contact them; hosting defence if illegal content is removed quickly once known | Owner details and contact email in the footer and Terms; fast takedown | Yes | 1, 5 |
| Defamation Act 2013 (s5) and website operators regulations 2013 | Defence for website operators who follow the notice process for defamatory posts | Defamation complaint type in the report form, with the required steps | Light | 1 |
| Copyright, Designs and Patents Act 1988 | Users must not share infringing content; hosts should act on notices | Copyright report form and takedown; acceptable use policy | Yes | 1 |
| Terrorism Act 2006 (s3) | Remove unlawfully terrorist-related content when given a police notice | Same moderation queue, with priority handling | Light | 1 |

### United Kingdom: consumers, business and security

| Law (year) | What it requires | How Office Talk meets it | Demo | Phase |
| --- | --- | --- | --- | --- |
| Equality Act 2010 | Don't shut out disabled users | WCAG 2.2 AA target; automated checks in CI; accessibility statement | Yes | 1 onward |
| Computer Misuse Act 1990 | Unauthorised access is a crime; also limits who may security-test the system | Only test your own systems; security.txt with a safe-harbour statement for researchers | Yes | 5 |
| Investigatory Powers Act 2016 | Rules for lawful government requests for data | Written process for law enforcement requests; disclose only with valid legal process | Light | 5 |
| Consumer Rights Act 2015 and Consumer Contracts Regulations 2013 | If consumers sign up: clear pre-contract information, 14-day cancellation, fair terms | Terms written in plain English; trial and cancellation explained | Launch (business customers) | 5 |
| Digital Markets, Competition and Consumers Act 2024 | Unfair commercial practices rules since April 2025 (no misleading prices, fake reviews or drip pricing) | Prices shown "+ VAT" clearly, no fake testimonials (the wireframe placeholder quotes must be real or removed) | Yes | 5 |
| Business Protection from Misleading Marketing Regulations 2008 | Marketing to businesses must not mislead | Accurate landing and pricing pages, labelled as a demo | Yes | 5 |
| Trade Marks Act 1994 | The name must not infringe a registered trade mark | Search the UK IPO register for "Office Talk" before buying the domain | Yes | 0 |
| UK sanctions (Sanctions and Anti-Money Laundering Act 2018) | Don't provide services to sanctioned people or places | Stripe screens payments; block comprehensively sanctioned regions at Cloudflare | Light | 5 |
| Value Added Tax Act 1994 | VAT registration above the threshold | Not registered; VAT shown as a demo in Stripe Tax | Launch | 5 |

### European Union

| Law (year) | What it requires | How Office Talk meets it | Demo | Phase |
| --- | --- | --- | --- | --- |
| GDPR (2016, applied 2018) | Same core duties as UK GDPR for anyone in the EU; a non-EU company serving EU users needs an EU representative | Same tools as the UK; EU representative only on launch | Light | 1, 5 |
| ePrivacy Directive (2002, amended 2009) | Consent before any non-essential cookie | Essential cookies only, so no banner is needed | Yes | 1 |
| Digital Services Act (applied 2024) | Hosting services: notice-and-action form, statement of reasons for every removal, a single point of contact, moderation rules in the terms, act on authority orders; a legal representative if not in the EU | Report form; reasons sent with every removal; contact page; moderation rules in Terms | Light | 1, 5 |
| Terrorist Content Online Regulation (applied 2022) | Hosting services offering services in the EU must remove terrorist content within 1 hour of a removal order, keep it for 6 months, tell the user and offer a complaint route | "Authority order" item in the moderation queue with a 1-hour alert to the owner; content kept in a locked store for 6 months | Light | 1 |
| EU Data Act (cloud switching since 12 Sep 2025) | SaaS is a data processing service: customers can switch, export all data in open formats, 30-day transition; switching charges cost-only now, banned from 12 Jan 2027 | Company-wide export (JSON plus original files); no exit fees; switching terms in the contract | Yes (build it anyway) | 5 |
| International transfer rules (GDPR Chapter V) | Data sent to US sub-processors needs a lawful route | Check LiveKit, Stripe, Cloudflare and Sentry are certified under the EU-US Data Privacy Framework (and UK extension) or sign standard contractual clauses | Yes | 5 |
| Copyright rules (E-Commerce Directive hosting defence, now in the DSA) | Act on notices of infringing content | Same copyright form as the UK and US | Yes | 1 |

### United States

| Law (year) | What it requires | How Office Talk meets it | Demo | Phase |
| --- | --- | --- | --- | --- |
| FTC Act, Section 5 (1914) | No unfair or deceptive practices, including privacy and security claims | Privacy notice written from what the code actually does; reviewed each phase | Yes | 5 |
| COPPA (1998; amended rule enforced since 22 Apr 2026) | Strict rules for collecting data from under-13s | 16+ age gate; delete any account found to belong to an under-13 | Yes | 1 |
| TAKE IT DOWN Act (2025; platform duties since 19 May 2026) | A clear public process to request removal of non-consensual intimate images; remove them and known identical copies within 48 hours | Dedicated request form (signature and good-faith statement), 48-hour timer with alerts, image hashing for identical copies, records kept | Yes | 1, 3 |
| 18 U.S.C. 2258A, as amended by the REPORT Act (2024) | Report apparent child sexual exploitation, trafficking and enticement to NCMEC; preserve report material for 1 year, kept securely | NCMEC escalation path in the moderation queue; locked evidence store with 1-year retention | Yes | 1 |
| DMCA Section 512 (1998) | Safe harbour from copyright claims with a registered agent, takedown and counter-notice, and a repeat-infringer policy | Copyright form and counter-notice flow; agent registered on launch | Light | 1, 5 |
| Communications Decency Act, Section 230 (1996) | Protects platforms from liability for most user content and for good-faith moderation | No build duty; moderation rules in Terms | Yes | — |
| Electronic Communications Privacy Act and Stored Communications Act (1986) | Don't disclose users' messages except as the law allows (valid legal process) | Same law enforcement request process as the UK | Light | 5 |
| ESIGN Act (2000) | Online click-through agreements are valid if acceptance is recorded | Store who accepted which version of the Terms, and when | Yes | 1 |
| CAN-SPAM Act (2003) | Marketing emails need an unsubscribe link and a postal address | Unsubscribe on any non-transactional email | Yes | 6 |
| Americans with Disabilities Act (1990) | US courts often expect websites to be accessible | WCAG 2.2 AA, as above | Yes | 1 onward |
| State comprehensive privacy laws (California CCPA/CPRA since 2020, and others) | 20 states have laws in force and 24 have passed one; rights to access, delete and opt out; honour Global Privacy Control in many; most apply only above revenue or data-volume thresholds | Same export and delete tools; no selling or ad sharing; GPC respected | Far below thresholds | 5 |
| State breach notification laws (all 50 states) | Tell affected residents, and sometimes regulators, after a breach | Breach plan covers UK, EU and US notice | Yes | 5 |
| State laws on minors and social media | Several states restrict minors' social media accounts; most exempt workplace tools | Check before allowing under-18s in the US; simplest is 18+ for US users | Check | 1 |
| OFAC sanctions | Don't serve sanctioned countries or people | Same blocking as the UK | Light | 5 |

### Checked and not applicable now

| Law | Why not | When it would apply |
| --- | --- | --- |
| EU AI Act | No AI features in v4 | If AI summaries return: label AI output and check its transparency rules |
| EU NIS2 Directive | Applies to medium and large firms | If Office Talk grew to medium size |
| EU Cyber Resilience Act | Covers products with digital elements, not pure SaaS | If a desktop or mobile app is shipped |
| European Accessibility Act (since June 2025) | Covers certain consumer services; micro-enterprises are exempt | Consumer sales at scale (WCAG 2.2 AA covers it anyway) |
| UK NIS Regulations 2018 | Only for essential services and larger digital providers | If designated or grown past the size limits |
| PCI DSS (card industry standard) | Stripe Checkout keeps card data off Office Talk's servers | Only if card data ever touched the servers |
| TCPA, CIPA, VPPA, Illinois BIPA (US) | No SMS marketing, no tracking pixels or session replay, no video rental records, no face or fingerprint data | If any of those features were added |
| UK Companies Act trading disclosures | Not a company | If it becomes a limited company |

### Starting soon

| Date | Law | What changes |
| --- | --- | --- |
| 9 Dec 2026 | EU Product Liability Directive (2024/2853) | Software, including SaaS, counts as a product: strict liability for defects, including missing security updates. Keep test, release and incident records |
| Jan 2027 | UK DMCC Act subscription contracts regime | Consumer subscriptions: renewal reminders, easy exit, cooling-off after trials and renewals. Applies only if consumers sign up |
| 12 Jan 2027 | EU Data Act switching charges | All switching and exit charges banned; Office Talk already charges none |
| 2027–2028 | New US state privacy laws (Alabama, Oklahoma, Vermont and others) | More state rights; same tools cover them |
| Expected 2028 | UK Cyber Security and Resilience Bill | Brings medium and large managed service providers under the NIS rules; Office Talk would be well below the size limits |

### Compliance pack

Everything written goes in `docs/compliance/` in the repo, which is itself a strong CV piece:

- [ ] This register, reviewed every 6 months and whenever a law above starts
- [ ] Privacy notice, Terms (moderation rules, switching terms, acceptance records), acceptable use policy, cookie notice
- [ ] Records of processing, DPIA, children's DPIA (Children's Code), sub-processor list, data processing agreement template
- [ ] Illegal content risk assessment, children's access and risk assessments (Online Safety Act)
- [ ] Takedown playbook: TAKE IT DOWN (48 hours), terrorist content orders (1 hour), illegal content, copyright, defamation, NCA and NCMEC escalation
- [ ] Law enforcement request process and breach plan with UK, EU and US notice steps
- [ ] Accessibility statement and the latest audit; security.txt
- [ ] "If it launches" list: ICO fee, EU representative and DSA legal representative, DMCA agent, VAT, trade mark registration, solicitor's review, penetration test

Sources: [DUAA commencement (DLA Piper)](https://privacymatters.dlapiper.com/2026/02/uk-commencement-of-the-data-protection-provisions-in-the-data-use-and-access-act/), [DUAA complaints duty (Squire Patton Boggs)](https://www.squirepattonboggs.com/insights/publications/the-data-use-and-access-act-2025-and-the-new-right-for-individuals-to-complain-to-controllers/), [Ofcom illegal content duties](https://www.ofcom.org.uk/online-safety/illegal-and-harmful-content/illegal-content-duties-under-the-online-safety-act), [Ofcom important dates](https://www.ofcom.org.uk/online-safety/illegal-and-harmful-content/important-dates-for-online-safety-compliance), [DMCC subscriptions from January 2027 (Stephenson Harwood)](https://shlegal.com/insights/subscription-reforms-brought-forward-to-january-2027-is-your-business-ready/), [DMCC unfair practices since April 2025 (Osborne Clarke)](https://www.osborneclarke.com/insights/uk-digital-markets-competition-and-consumers-act-subscription-contracts-regime-take-shape), [Cyber Security and Resilience Bill (Trowers)](https://www.trowers.com/insights/the-cyber-security-and-resilience-bill-a-new-era-for-uk-cybersecurity-regulation), [EU Data Act switching (Cooley)](https://www.cooley.com/news/insight/2025/2025-09-08-paas-iaas-or-saas-be-aware-new-switching-rules-will-become-applicable-in-eu), [Terrorist Content Online Regulation (Freshfields)](https://technologyquotient.freshfields.com/post/102hv7d/terrorist-content-regulation-online-platforms-now-have-one-hour-to-remove-terro), [EU Product Liability Directive (Sidley)](https://www.sidley.com/en/insights/newsupdates/2026/10/revised-eu-product-liability-directive), [COPPA amended rule (Federal Register)](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule), [FTC on the TAKE IT DOWN Act](https://www.ftc.gov/node/332132), [REPORT Act (Wilson Sonsini)](https://wsgr.com/en/insights/new-minor-safety-obligations-for-online-services-report-act-expands-child-sexual-exploitation-reporting-requirements.html), [US state privacy laws (MultiState)](https://www.multistate.us/insider/2026/10/28/twenty-four-states-now-have-comprehensive-consumer-privacy-laws).

## 12. Security and reliability

Security stays at full strength: it is what a technical reviewer of the CV looks at first, and several laws in section 11 require it. A phase is only done when its items below are done and tested.

### Security

| Risk | Required protection | Phase |
| --- | --- | --- |
| Broken access control and IDOR | One `can()` check per request, `company_id` filter on every query, random UUIDs, cross-company tests | 1 |
| Cross-site scripting | Escape output; chat as sanitised markdown, no raw HTML; strict Content Security Policy; HttpOnly, Secure, SameSite cookies | 1 |
| Injection | SQLAlchemy parameterised queries only; Pydantic validation; never pass user text to a shell | 0 |
| Cross-site request forgery | SameSite cookies plus CSRF tokens on state-changing requests | 1 |
| WebSocket hijacking | Authenticate the handshake, check Origin, re-check permission on every subscribe, limit size and rate | 1 |
| Password attacks and bots | Argon2; breached-password check; 5 failed sign-ins per account in 15 min, then CAPTCHA and growing delay (soft lock); same response whether or not an email exists; MFA; rotating refresh tokens; sign out everywhere; new-device email | 1 |
| Spam inside the product | Lower limits for new accounts; limits on messages, uploads and invites per hour; admins can mute or remove | 1 |
| SSRF (link previews) | Fetch links through a proxy that blocks internal addresses | 1 |
| Frozen accounts | A frozen member cannot sign in to that company; their sessions and tokens are revoked at once | 1 |
| Insecure uploads | Allow-list, real content type, size limits, renamed files, private bucket, malware scan | 3 |
| Uncontrolled sharing | No public links by default; share links expire and can be revoked; admins can switch them off | 3 |
| Guest call abuse | One-room tokens that end after 6 hours, password option, waiting room, instant removal, CAPTCHA on join | 4 |
| Payment data | Stripe Checkout and portal only; verify Stripe webhook signatures | 5 |
| Leaked secrets and old dependencies | Secret scanning, Secrets Manager, Dependabot, pip-audit, npm audit, pinned versions | 0 |
| Data exposure | TLS everywhere, encrypted database volume, S3 and backups, security headers | 0 |
| No trail after an incident | Log sign-ins, permission changes, admin actions and file transfers; never log passwords, tokens or message text | 1 |
| Unknown weaknesses | OWASP ZAP scan, plus a fresh-eyes Claude review of the whole codebase against this table | 5 |

### Reliability

- Nightly encrypted backups of Postgres, and of changed S3 files to Glacier Deep Archive; a restore test before friend testing, then monthly. Targets: lose at most 24 hours of data, recover within 4 hours.
- Uptime checks, Sentry error tracking, and alerts for spikes in failed sign-ins, errors or slow responses.
- Separate development, staging and production; no real customer data outside production.
- CI blocks any merge with failing unit, permission or end-to-end tests.
- A load test with many simulated users and calls in phase 5, with the results in the README.
- Monthly dependency and server updates; Dependabot pull requests reviewed weekly.
- A one-page incident plan: detect, contain, assess, notify within the legal deadline, fix, review.
- A published security contact and `security.txt`.

## 13. Decisions needed and open questions

Pricing, storage, roles and guests are settled. The few open items below each have a suggested answer the build will use if it isn't changed.

### Settled

| Question | Answer |
| --- | --- |
| Name and purpose | Office Talk, a CV portfolio project; no real payments |
| Time and plan | 2 hours a week, Claude Pro |
| Seat price | £7 per seat, minimum 3, no base fee; yearly 10% off |
| Storage | 10 GB personal + 10 GB project per seat (split or pinned); 10 GB company base; +10 GB £2, +100 GB £7 |
| Chat attachments | Everything except text counts; private chats use personal storage, channels use project storage; Chat folder in date order |
| Old-image deletion | No such button, so nothing important is lost |
| Storage control and alerts | Team manager and IT team, for personal and project storage |
| Over the limit | No new uploads, nothing deleted, manager and IT alerted |
| Chats between people | Chat and Files tabs only |
| People who leave | Frozen; seat charged until closed; "Transfer files and close" |
| Guests | No accounts; 6 hours per visit; link ends with the meeting |
| Age | 16+ |
| Free companies | Platform admin page, "free until" date picker, all features |
| Backups | Nightly, changed files only, Glacier Deep Archive |
| Company address | `yoursite.com/c/acme` after sign-in |
| AI summaries | Removed for now |
| Joining calls | Mic and camera off; pre-join screen to switch them on |

### Still open

- [ ] **Domain** for Office Talk. Needed before deploying in phase 0.
- [ ] **Terraform or AWS CDK.** Suggested: Terraform.
- [ ] **Joining a new project.** When someone joins another project, re-split their 10 GB automatically (unless pinned)? Suggested: yes.
- [ ] **Message retention default.** Suggested: keep until deleted; IT can set 90 days, 1 year or 3 years.
- [ ] **Phase order.** Should files come before tasks and roadmap?
- [ ] **OnlyOffice on and off** (section 10). Suggested: start on demand, stop every evening.
- [ ] **After the trial or a free company's end date.** Suggested: read-only until a test card is added or the date is extended.
- [ ] **After week 51.** Stop at "portfolio complete", build phase 6, or bring back AI summaries?
- [ ] **Under-18s.** 16+ brings in the UK Children's Code and the Online Safety Act's children's duties (section 11). Keep 16+ everywhere, or make it 18+ for US users only? Suggested: 16+ in the UK and EU, 18+ in the US.
