// ─── SHARED ──────────────────────────────────────────────────────────────────
export const OBJECTIVES = [
  "Increase wedding enquiries","Push a specific venue","Promote selected dates",
  "Drive showcase registrations","Convert old leads","Increase appointments",
  "Promote a new package","Collect deposits","Fill low-demand months",
  "Promote food tasting","Retarget warm leads",
]

export const LEAD_TIMES = [
  { channel:"Showcase (overall)", deliverable:"Full showcase campaign",                 sop:"4 weeks minimum",               leadDays:28 },
  { channel:"Showcase + Vendors", deliverable:"Showcase with vendor partners",          sop:"4–6 weeks",                     leadDays:42 },
  { channel:"Multi-channel",      deliverable:"Meta + SEM + EDM together",              sop:"4–6 weeks",                     leadDays:42 },
  { channel:"Meta Ads",           deliverable:"Showcase / event registration campaign", sop:"3–4 weeks before event",        leadDays:28 },
  { channel:"Meta Ads",           deliverable:"Full campaign, multiple ad sets",        sop:"14 working days (~3 wks)",      leadDays:21 },
  { channel:"Meta Ads",           deliverable:"Retargeting campaign",                   sop:"10–14 working days (~2–3 wks)", leadDays:20 },
  { channel:"SEM (Google)",       deliverable:"Full SEM campaign for showcase",         sop:"3–4 weeks before event",        leadDays:28 },
  { channel:"SEM (Google)",       deliverable:"Campaign w/ new landing page edits",     sop:"3–4 weeks",                     leadDays:28 },
  { channel:"EDM",                deliverable:"Showcase invitation EDM",                sop:"10–14 working days (~2–3 wks)", leadDays:20 },
  { channel:"Organic Social",     deliverable:"Full content set for campaign",          sop:"10–14 working days (~2–3 wks)", leadDays:20 },
  { channel:"WhatsApp",           deliverable:"Full lead nurture sequence",             sop:"7–10 working days (~1.5–2 wks)",leadDays:14 },
]

// ─── EVENT CATEGORIES ────────────────────────────────────────────────────────
// Each category drives its own timeline (TASK_SETS) and collateral (COLLATERAL_SETS).
export const CATEGORIES = [
  { key:"showcase", label:"Showcase / Open House", desc:"Full 8-week plan (showcases, open houses, food tasting)" },
  { key:"promo",    label:"Promo / Flash Sale",    desc:"2–3 week burst (National Day, 11.11, 12.12, deposit drives)" },
  { key:"campaign", label:"Lead-Gen Campaign",     desc:"4-week content-led (engagement, New Year)" },
  { key:"nurture",  label:"Nurture (no promo)",    desc:"Organic + EDM only (Ramadan)" },
  { key:"launch",   label:"Brand Launch",          desc:"With partner-approval gates (yuu launch)" },
]

// ─── SHOWCASE TASKS (full 8-week plan) ───────────────────────────────────────
const SHOWCASE_TASKS = [
  { offset:-56, label:"-8 wks",  phase:"Plan & Brief", team:"BOTH",  priority:"P1", task:"Marketing–Sales kickoff: confirm objective, hero offer, audience, partner vendors", owner:"TD + NSH", depends:"Venue/date confirmed", notes:"Output: completed Sales brief. Lock offer before outreach." },
  { offset:-56, label:"-8 wks",  phase:"Plan & Brief", team:"SALES", priority:"P1", task:"Complete the Sales→Marketing brief: objective, audience, offer, CTA, lead destination", owner:"NSH", depends:"Kickoff done", notes:"Marketing shouldn't have to guess pricing or mechanics." },
  { offset:-56, label:"-8 wks",  phase:"Plan & Brief", team:"SALES", priority:"P1", task:"Pull warm lead list from GHL — filter active enquiries for VIP invitations", owner:"NSH", depends:"Kickoff done", notes:"Segment by date interest, package tier, recency." },
  { offset:-49, label:"-7 wks",  phase:"Plan & Brief", team:"SALES", priority:"P1", task:"Define event-exclusive offer — confirm with Shermen + Tania before any outreach", owner:"NSH + SHR → Tania", depends:"Budget sign-off", notes:"Specific, time-limited offer. Management approves promo pricing + ad budget." },
  { offset:-49, label:"-7 wks",  phase:"Plan & Brief", team:"MKT",   priority:"P1", task:"Finalise creative concept, theme direction & key visual (KV)", owner:"TD", depends:"Brief complete", notes:"KV is the basis for all assets. Tania approves before designer starts." },
  { offset:-49, label:"-7 wks",  phase:"Plan & Brief", team:"TANIA", priority:"P1", task:"APPROVAL: Key visual & creative concept", owner:"Tania", depends:"KV draft", notes:"Nothing goes to production without this." },
  { offset:-49, label:"-7 wks",  phase:"Plan & Brief", team:"SALES", priority:"P1", task:"Confirm staffing roster — who attends, which days, arrival times", owner:"NSH", depends:"Kickoff done", notes:"Stagger NSH + LLA for multi-day. Assign booth lead per day." },
  { offset:-42, label:"-6 wks",  phase:"Collateral",   team:"MKT",   priority:"P1", task:"Design: event banner, e-invite, booth backdrop & all print collateral", owner:"TD + DES", depends:"KV approved", notes:"⚠️ Allow min 10 working days for print after approval." },
  { offset:-42, label:"-6 wks",  phase:"Collateral",   team:"MKT",   priority:"P1", task:"Partner vendor co-branded assets — request logos & draft posts", owner:"CI", depends:"Vendor list", notes:"Give vendors 1 week. Chase day 5. Vendor sign-off needed." },
  { offset:-42, label:"-6 wks",  phase:"Collateral",   team:"MKT",   priority:"P1", task:"Meta ad creatives — design ad set (awareness, lead gen, retargeting)", owner:"CI + DES", depends:"KV approved", notes:"Full multi-ad-set campaign needs ~14 working days." },
  { offset:-42, label:"-6 wks",  phase:"Collateral",   team:"SALES", priority:"P1", task:"Prepare/update package brochures and price guides for booth handout", owner:"NSH + TD", depends:"Pricing approved", notes:"Tania approves pricing copy before print." },
  { offset:-42, label:"-6 wks",  phase:"Collateral",   team:"TANIA", priority:"P1", task:"APPROVAL: All print collateral + Meta ad creatives", owner:"Tania", depends:"Drafts ready", notes:"Nothing to print or Ads Manager without sign-off. Allow 48hr." },
  { offset:-35, label:"-5 wks",  phase:"Collateral",   team:"MKT",   priority:"P1", task:"Landing page / RSVP form live — connected to GHL", owner:"CI + TD", depends:"Capacity confirmed", notes:"Lead destination ready BEFORE ads. Test → GHL first." },
  { offset:-35, label:"-5 wks",  phase:"Collateral",   team:"MKT",   priority:"P2", task:"All 4 EDM templates drafted (Save the Date / Reminder / Final Push / Thank-You)", owner:"CI", depends:"Programme confirmed", notes:"Write all 4 at once. Tania approves before sends." },
  { offset:-35, label:"-5 wks",  phase:"Collateral",   team:"TANIA", priority:"P1", task:"APPROVAL: Landing page copy + all 4 EDM templates", owner:"Tania", depends:"Drafts from CI", notes:"Approve before CI schedules sends." },
  { offset:-35, label:"-5 wks",  phase:"Collateral",   team:"SALES", priority:"P1", task:"Send personalised VIP invitations to warm leads — WhatsApp + EDM #1", owner:"NSH + LLA", depends:"List + RSVP link", notes:"Personalise. Reference their enquiry. Not a mass blast." },
  { offset:-28, label:"-4 wks",  phase:"Launch",       team:"BOTH",  priority:"P1", task:"PRE-LAUNCH check: offer, audience, lead destination & approvals confirmed", owner:"NSH + TD → Tania", depends:"Brief + destination ready", notes:"Confirm brief complete and Tania signed off creatives." },
  { offset:-28, label:"-4 wks",  phase:"Launch",       team:"MKT",   priority:"P1", task:"Announcement post + Meta awareness ads live — 'Save the Date'", owner:"CI", depends:"Creatives approved", notes:"Organic across IG/FB/TikTok + paid awareness." },
  { offset:-28, label:"-4 wks",  phase:"Launch",       team:"TANIA", priority:"P1", task:"APPROVAL: Announcement post before it goes live", owner:"Tania", depends:"Draft from CI", notes:"First public-facing post. Must be approved." },
  { offset:-28, label:"-4 wks",  phase:"Launch",       team:"MKT",   priority:"P1", task:"EDM #1 broadcast to database (Save the Date)", owner:"CI", depends:"Template approved", notes:"Send Tue/Wed AM. RSVP link with tracking." },
  { offset:-28, label:"-4 wks",  phase:"Launch",       team:"SALES", priority:"P2", task:"First follow-up on VIP invites — WhatsApp check-in with non-responders", owner:"LLA", depends:"Invites sent", notes:"'Checking you saw our message…'" },
  { offset:-21, label:"-3 wks",  phase:"Build-up",     team:"MKT",   priority:"P2", task:"Vendor spotlight series — 1 post per vendor, 2–3x/week", owner:"CI", depends:"Vendor assets", notes:"Ask vendors to reshare." },
  { offset:-21, label:"-3 wks",  phase:"Build-up",     team:"MKT",   priority:"P1", task:"Launch Meta lead-gen ad set + SEM (if briefed) — RSVP / consultation", owner:"CI", depends:"Lead ad + form ready", notes:"Lookalike of converted leads. SEM for high-intent." },
  { offset:-21, label:"-3 wks",  phase:"Build-up",     team:"MKT",   priority:"P2", task:"TikTok / Reels teaser — BTS of décor or booth build (30–60s)", owner:"CI + TD", depends:"Décor finalised", notes:"Hook in first 2 seconds." },
  { offset:-21, label:"-3 wks",  phase:"Build-up",     team:"MKT",   priority:"P1", task:"EDM #2 — event reminder with agenda, vendors & perks", owner:"CI", depends:"Programme confirmed", notes:"Send Tue/Wed AM. Agenda + consultation link." },
  { offset:-21, label:"-3 wks",  phase:"Build-up",     team:"SALES", priority:"P1", task:"Set up on-site consultation booking system", owner:"NSH", depends:"Layout confirmed", notes:"20-min slots, max 4/hour per consultant." },
  { offset:-21, label:"-3 wks",  phase:"Build-up",     team:"SALES", priority:"P1", task:"Confirm lead-response SLAs with the team (per SOP)", owner:"NSH", depends:"Consultants assigned", notes:"WhatsApp 15–30 min, Meta form 1–2 hrs, RSVP 24 hrs." },
  { offset:-21, label:"-3 wks",  phase:"Build-up",     team:"SALES", priority:"P1", task:"Pack booth kit: brochures, QR sheets, pens, giveaways, cards", owner:"NSH + LLA", depends:"Collateral delivered", notes:"Print 20% more than RSVP for walk-ins." },
  { offset:-14, label:"-2 wks",  phase:"Final Push",   team:"MKT",   priority:"P1", task:"Countdown Stories + Meta retargeting/final-push ads", owner:"CI", depends:"RSVP count; creative approved", notes:"Retarget engagers + non-converters. Pause at event end." },
  { offset:-14, label:"-2 wks",  phase:"Final Push",   team:"MKT",   priority:"P1", task:"EDM #3 + WhatsApp blast — final reminder with directions & parking", owner:"CI + NSH", depends:"Guest list; map confirmed", notes:"Address, parking, what to bring, slot reminder." },
  { offset:-14, label:"-2 wks",  phase:"Final Push",   team:"TANIA", priority:"P1", task:"APPROVAL: EDM #3 and WhatsApp blast copy", owner:"Tania", depends:"Draft from CI", notes:"Last pre-event comms. Must be approved." },
  { offset:-14, label:"-2 wks",  phase:"Final Push",   team:"SALES", priority:"P1", task:"Final follow-up to VIPs who haven't RSVP'd", owner:"NSH + LLA", depends:"RSVP status", notes:"'We've reserved a slot — confirm to hold it.'" },
  { offset:-14, label:"-2 wks",  phase:"Final Push",   team:"SALES", priority:"P1", task:"All-staff briefing: arrival, roles, talking points, hero offer, layout", owner:"NSH", depends:"Layout + offer confirmed", notes:"Everyone knows the offer, the pitch, when to escalate." },
  { offset: -7, label:"-1 wk",   phase:"Final Push",   team:"MKT",   priority:"P2", task:"Final social push — last 3 posts: excitement, vendor preview, 'see you there'", owner:"CI", depends:"—", notes:"" },
  { offset: -7, label:"-1 wk",   phase:"Final Push",   team:"SALES", priority:"P1", task:"Print all final materials; check quantities vs RSVP", owner:"LLA", depends:"Collateral; RSVP count", notes:"Print 20% more. Spares in separate box." },
  { offset: -7, label:"-1 wk",   phase:"Final Push",   team:"SALES", priority:"P1", task:"GHL pipeline: create event source tag; confirm RSVPs in pipeline", owner:"NSH", depends:"RSVP list closed", notes:"Tag: [Event] RSVP — drives follow-up tracking." },
  { offset: -3, label:"-3 days", phase:"Final Push",   team:"BOTH",  priority:"P1", task:"All-team confirmation: attendance, arrival, role", owner:"NSH + TD", depends:"—", notes:"Share address, parking, NSH mobile as emergency contact." },
  { offset: -1, label:"-1 day",  phase:"Final Push",   team:"SALES", priority:"P1", task:"Prepare lead capture kit: QR sheets, pens, forms, backup paper", owner:"LLA", depends:"QR tested", notes:"Test QR tonight. Bring backup manual form." },
  { offset:  0, label:"Event",   phase:"Event Day",    team:"SALES", priority:"P1", task:"Arrive early — booth setup, signage, QR codes tested", owner:"NSH + LLA", depends:"Packed", notes:"Arrive 90 min before open. Confirm power + Wi-Fi." },
  { offset:  0, label:"Event",   phase:"Event Day",    team:"MKT",   priority:"P1", task:"On-site content: Live Stories, B-roll, couple reactions", owner:"CI (on-site)", depends:"Shot list", notes:"Check with Tania before posting live." },
  { offset:  0, label:"Event",   phase:"Event Day",    team:"TANIA", priority:"P1", task:"APPROVAL: Any live post on event day", owner:"Tania", depends:"Draft from CI", notes:"CI sends via WhatsApp. Nothing posts without a thumbs up." },
  { offset:  0, label:"Event",   phase:"Event Day",    team:"SALES", priority:"P1", task:"Run consultation slots — capture details in GHL on the day", owner:"NSH + LLA", depends:"Booking set up", notes:"Flag HOT leads (date + budget) to NSH immediately." },
  { offset:  0, label:"Event",   phase:"Event Day",    team:"SALES", priority:"P1", task:"End of day: collect lead forms, count materials, photograph booth", owner:"LLA", depends:"—", notes:"Pack-down. Nothing left at venue." },
  { offset:  2, label:"+2 days", phase:"Follow-up",    team:"MKT",   priority:"P1", task:"Thank-you post + recap Reel + Meta post-event ad — tag vendors", owner:"CI + TD", depends:"Photos + footage", notes:"Recap Reel within 48 hrs. Reuse as post-event ad." },
  { offset:  2, label:"+2 days", phase:"Follow-up",    team:"TANIA", priority:"P1", task:"APPROVAL: Recap Reel and thank-you post", owner:"Tania", depends:"Drafts from CI", notes:"Fast turnaround — flag same night." },
  { offset:  2, label:"+2 days", phase:"Follow-up",    team:"SALES", priority:"P1", task:"Tier all leads Hot/Warm/Cold; upload to GHL with event tag", owner:"NSH", depends:"Forms collected", notes:"Hot leads: call/WhatsApp within 48 hrs." },
  { offset:  2, label:"+2 days", phase:"Follow-up",    team:"SALES", priority:"P1", task:"Call / WhatsApp ALL Hot leads — offer consultation within 7 days", owner:"NSH + LLA", depends:"Hot list", notes:"Reference booth chat. Offer 2–3 slots." },
  { offset:  7, label:"+1 wk",   phase:"Follow-up",    team:"MKT",   priority:"P1", task:"EDM #4 — thank-you + follow-up offer (tiered)", owner:"CI + NSH", depends:"Tiered list; approved", notes:"Hot leads personalised. Cold gets newsletter." },
  { offset:  7, label:"+1 wk",   phase:"Follow-up",    team:"TANIA", priority:"P1", task:"APPROVAL: EDM #4 before send", owner:"Tania", depends:"Draft from CI", notes:"" },
  { offset:  7, label:"+1 wk",   phase:"Follow-up",    team:"SALES", priority:"P1", task:"Book follow-up consultations with all Hot leads", owner:"NSH + LLA", depends:"+2 day follow-ups done", notes:"Target: Hot leads consulted within 2 weeks." },
  { offset:  7, label:"+1 wk",   phase:"Follow-up",    team:"SALES", priority:"P1", task:"Sales report to Shermen + Tania: leads, consultations, soft bookings", owner:"NSH", depends:"Leads in GHL", notes:"Total leads, tier breakdown, ROI estimate." },
  { offset: 14, label:"+2 wks",  phase:"Review",       team:"SALES", priority:"P1", task:"Close soft bookings — convert warm consultations to deposits", owner:"NSH + LLA", depends:"Consultation schedule", notes:"Decision within 2 weeks per lead." },
  { offset: 14, label:"+2 wks",  phase:"Review",       team:"BOTH",  priority:"P1", task:"Post-campaign review: reach, leads, cost/lead, best creative, conversions", owner:"TD + NSH + SHR", depends:"Analytics + sales data", notes:"Marketing: reach/leads/CPL/creative. Sales: enquiries→deposits." },
]

// ─── PROMO / FLASH SALE TASKS (2–3 week burst) ───────────────────────────────
const PROMO_TASKS = [
  { offset:-21, label:"-3 wks",  phase:"Plan & Brief", team:"BOTH",  priority:"P1", task:"Confirm promo offer, perk, yuu sweetener & deadline", owner:"NSH + TD → Tania", depends:"Budget sign-off", notes:"Keep it simple, time-limited, one clear CTA." },
  { offset:-21, label:"-3 wks",  phase:"Plan & Brief", team:"SALES", priority:"P1", task:"Pull warm / retarget lead list from GHL for the flash", owner:"NSH", depends:"—", notes:"Flash targets people already aware — warm audiences." },
  { offset:-18, label:"-2.5 wks",phase:"Plan & Brief", team:"TANIA", priority:"P1", task:"APPROVAL: promo offer + mechanics", owner:"Tania", depends:"Offer drafted", notes:"Confirm validity dates and any yuu bonus amount." },
  { offset:-14, label:"-2 wks",  phase:"Collateral",   team:"MKT",   priority:"P1", task:"Design flash creative pack: offer tile + 1 Reel + countdown Stories", owner:"CI + DES", depends:"Offer approved", notes:"Punchy, on-brand. The offer IS the hook." },
  { offset:-14, label:"-2 wks",  phase:"Collateral",   team:"MKT",   priority:"P2", task:"Draft flash EDM + WhatsApp blast copy + countdown landing page", owner:"CI", depends:"Offer approved", notes:"Short, urgent, deadline-led." },
  { offset:-10, label:"-1.5 wks",phase:"Collateral",   team:"TANIA", priority:"P1", task:"APPROVAL: all flash creatives + copy (route yuu items to Advocado)", owner:"Tania", depends:"Drafts ready", notes:"⚠️ If yuu is mentioned, needs Advocado sign-off — add lead time." },
  { offset: -8, label:"-1 wk",   phase:"Collateral",   team:"MKT",   priority:"P1", task:"Build retargeting ad set in Meta (warm audiences)", owner:"CI", depends:"Creative approved", notes:"Retargeting only — don't push flash to cold traffic." },
  { offset: -3, label:"-3 days", phase:"Launch",       team:"MKT",   priority:"P1", task:"Tease the flash — Stories + 1 post ('coming this weekend')", owner:"CI", depends:"Approved", notes:"Build anticipation 2–3 days out." },
  { offset:  0, label:"Flash",   phase:"Launch",       team:"MKT",   priority:"P1", task:"Flash LIVE — offer post + Reel + retargeting ads on", owner:"CI", depends:"All approved", notes:"Go live morning of. Pin the offer post." },
  { offset:  0, label:"Flash",   phase:"Launch",       team:"MKT",   priority:"P1", task:"Flash EDM + WhatsApp blast to warm list", owner:"CI + NSH", depends:"Copy approved", notes:"Send early. Include deadline + WhatsApp link." },
  { offset:  0, label:"Flash",   phase:"Launch",       team:"SALES", priority:"P1", task:"Sales on standby — fast WhatsApp response to deposit enquiries", owner:"NSH + LLA", depends:"—", notes:"Speed wins flashes. Respond in minutes." },
  { offset:  3, label:"end",     label2:"deadline", phase:"Final Push", team:"MKT", priority:"P1", task:"Urgency push — '48h left' / 'final day' Stories + post", owner:"CI", depends:"—", notes:"Scarcity messaging as deadline nears." },
  { offset:  4, label:"deadline",phase:"Final Push",   team:"SALES", priority:"P1", task:"Deadline day — close deposits, WhatsApp final non-responders, log in GHL", owner:"NSH + LLA", depends:"—", notes:"Tag deposits with promo source in GHL." },
  { offset:  6, label:"+2 days", phase:"Follow-up",    team:"SALES", priority:"P1", task:"Follow up promo leads who didn't convert; tier in GHL", owner:"NSH", depends:"Promo closed", notes:"Roll non-converters into the next nurture touch." },
  { offset:  6, label:"+2 days", phase:"Follow-up",    team:"MKT",   priority:"P2", task:"Pause flash ads; quick results recap to Tania", owner:"CI", depends:"—", notes:"Spend, leads, deposits, cost/booking." },
]

// ─── LEAD-GEN CAMPAIGN TASKS (4-week, content-led) ───────────────────────────
const CAMPAIGN_TASKS = [
  { offset:-28, label:"-4 wks",  phase:"Plan & Brief", team:"BOTH",  priority:"P1", task:"Confirm campaign theme, audience, content angle & CTA", owner:"NSH + TD", depends:"—", notes:"Nurture-led: educational/inspirational, soft CTA." },
  { offset:-28, label:"-4 wks",  phase:"Plan & Brief", team:"SALES", priority:"P1", task:"Define target segments in GHL for the campaign", owner:"NSH", depends:"—", notes:"e.g. newly engaged, mixed-race/nikah, parents." },
  { offset:-25, label:"-3.5 wks",phase:"Plan & Brief", team:"TANIA", priority:"P1", task:"APPROVAL: campaign concept + key message", owner:"Tania", depends:"Concept drafted", notes:"" },
  { offset:-21, label:"-3 wks",  phase:"Collateral",   team:"MKT",   priority:"P1", task:"Produce content set: 2–3 carousels + 2 Reels", owner:"CI + DES", depends:"Concept approved", notes:"Cover the angle from multiple emotional entry points." },
  { offset:-21, label:"-3 wks",  phase:"Collateral",   team:"MKT",   priority:"P1", task:"Build lead-gen ad + landing page / lead form (→ GHL)", owner:"CI + TD", depends:"Concept approved", notes:"Lead destination must be live before ads." },
  { offset:-18, label:"-2.5 wks",phase:"Collateral",   team:"MKT",   priority:"P2", task:"Draft EDM + WhatsApp nurture sequence", owner:"CI", depends:"Concept approved", notes:"Map the journey from enquiry to consultation." },
  { offset:-16, label:"-2 wks",  phase:"Collateral",   team:"TANIA", priority:"P1", task:"APPROVAL: all content + landing page + EDMs", owner:"Tania", depends:"Drafts ready", notes:"" },
  { offset:-14, label:"-2 wks",  phase:"Launch",       team:"MKT",   priority:"P1", task:"Campaign live — first posts + lead-gen ads on", owner:"CI", depends:"Approved", notes:"Open with the strongest hook piece." },
  { offset:-14, label:"-2 wks",  phase:"Launch",       team:"MKT",   priority:"P1", task:"EDM #1 to database", owner:"CI", depends:"Approved", notes:"Tue/Wed AM." },
  { offset:-10, label:"-1.5 wks",phase:"Build-up",     team:"MKT",   priority:"P2", task:"Mid-campaign content wave (educational/inspirational)", owner:"CI", depends:"—", notes:"Keep cadence: 3 posts/week + Stories." },
  { offset: -7, label:"-1 wk",   phase:"Build-up",     team:"SALES", priority:"P1", task:"Sales follow-up on incoming leads (per SLA)", owner:"NSH + LLA", depends:"Leads arriving", notes:"WhatsApp 15–30 min, form 1–2 hrs." },
  { offset: -3, label:"-3 days", phase:"Final Push",   team:"MKT",   priority:"P1", task:"Flagship content moment + EDM #2", owner:"CI", depends:"—", notes:"Campaign peak — strongest CTA." },
  { offset: -1, label:"-1 day",  phase:"Final Push",   team:"MKT",   priority:"P2", task:"Last push posts + Stories", owner:"CI", depends:"—", notes:"" },
  { offset:  2, label:"+2 days", phase:"Follow-up",    team:"SALES", priority:"P1", task:"Tier & follow up all campaign leads in GHL", owner:"NSH", depends:"Campaign closed", notes:"Prime warm leads for the next conversion event." },
  { offset:  7, label:"+1 wk",   phase:"Follow-up",    team:"MKT",   priority:"P2", task:"Campaign recap + best-performing content to Tania", owner:"CI", depends:"—", notes:"Reuse winning creative as ads." },
  { offset:  7, label:"+1 wk",   phase:"Review",       team:"BOTH",  priority:"P2", task:"Review reach / leads / CPL; note learnings", owner:"TD + NSH", depends:"Analytics", notes:"What angle landed? Feed into next campaign." },
]

// ─── NURTURE TASKS (Ramadan — organic + EDM, no promo) ───────────────────────
const NURTURE_TASKS = [
  { offset:-35, label:"-5 wks",  phase:"Plan & Brief", team:"MKT",   priority:"P1", task:"Plan Ramadan content calendar — reflective/spiritual themes (NO promo)", owner:"TD + CI", depends:"—", notes:"Marriage as ibadah, du'a, intention. No selling." },
  { offset:-32, label:"-4.5 wks",phase:"Plan & Brief", team:"TANIA", priority:"P1", task:"APPROVAL: Ramadan content direction (must be non-promotional)", owner:"Tania", depends:"Calendar drafted", notes:"Guardrail: no urgency, no discounts, no yuu." },
  { offset:-28, label:"-4 wks",  phase:"Collateral",   team:"MKT",   priority:"P1", task:"Produce reflective content batch: carousels + soft Reels + EDM", owner:"CI + DES", depends:"Direction approved", notes:"Warm, gentle, values-led tone." },
  { offset:-21, label:"-3 wks",  phase:"Collateral",   team:"TANIA", priority:"P1", task:"APPROVAL: all Ramadan content", owner:"Tania", depends:"Batch ready", notes:"" },
  { offset:-30, label:"Ramadan", phase:"Launch",       team:"MKT",   priority:"P1", task:"Ramadan begins — start gentle weekly organic nurture", owner:"CI", depends:"Approved", notes:"Dial ads down. Organic + EDM lead." },
  { offset:-18, label:"mid",     phase:"Build-up",     team:"MKT",   priority:"P2", task:"Mid-Ramadan EDM — reflection on marriage as ibadah", owner:"CI", depends:"—", notes:"No CTA beyond 'save/share'." },
  { offset:-10, label:"-1.5 wks",phase:"Build-up",     team:"MKT",   priority:"P2", task:"Continue nurture; engage replies warmly (no selling)", owner:"CI", depends:"—", notes:"Respond to DMs with care, not pitches." },
  { offset: -5, label:"last third",phase:"Final Push", team:"MKT",   priority:"P2", task:"Gently tease the post-Raya Syawal showcase", owner:"CI", depends:"—", notes:"Soft: 'celebrate with us after Raya'." },
  { offset:  2, label:"post-Raya",phase:"Follow-up",   team:"SALES", priority:"P1", task:"Re-engage warm contacts with a soft consultation invite", owner:"NSH + LLA", depends:"Raya passed", notes:"'When you're ready, we'd love to help.'" },
]

// ─── BRAND LAUNCH TASKS (e.g. yuu — with partner approval gates) ─────────────
const LAUNCH_TASKS = [
  { offset:-21, label:"-3 wks",  phase:"Plan & Brief", team:"BOTH",  priority:"P1", task:"Confirm launch message, assets needed & target timing", owner:"NSH + TD", depends:"—", notes:"What changes for the customer? Lead with the benefit." },
  { offset:-21, label:"-3 wks",  phase:"Plan & Brief", team:"MKT",   priority:"P1", task:"⚠️ Engage partner (Advocado) — agree announcement content + timing IN WRITING", owner:"TD", depends:"—", notes:"Contractual: initial announcement must be mutually agreed." },
  { offset:-18, label:"-2.5 wks",phase:"Plan & Brief", team:"TANIA", priority:"P1", task:"APPROVAL: launch concept + message", owner:"Tania", depends:"Concept drafted", notes:"" },
  { offset:-14, label:"-2 wks",  phase:"Collateral",   team:"MKT",   priority:"P1", task:"Design launch pack: announce Reel, carousel, Stories, landing module", owner:"CI + DES", depends:"Concept approved", notes:"Use partner-approved logos only — don't DIY branding." },
  { offset:-14, label:"-2 wks",  phase:"Collateral",   team:"MKT",   priority:"P2", task:"Draft launch EDM + WhatsApp blast", owner:"CI", depends:"Concept approved", notes:"" },
  { offset:-12, label:"-1.5 wks",phase:"Collateral",   team:"MKT",   priority:"P1", task:"⚠️ Obtain PARTNER approval on all launch creative", owner:"TD", depends:"Drafts ready", notes:"Advocado sign-off required before publish. Build in lead time." },
  { offset:-10, label:"-1.5 wks",phase:"Collateral",   team:"TANIA", priority:"P1", task:"APPROVAL: final launch creative (post-partner sign-off)", owner:"Tania", depends:"Partner approved", notes:"" },
  { offset:  0, label:"Launch",  phase:"Launch",       team:"MKT",   priority:"P1", task:"LAUNCH DAY — announcement Reel + carousel live", owner:"CI", depends:"All approved", notes:"Coordinate timing with partner." },
  { offset:  0, label:"Launch",  phase:"Launch",       team:"MKT",   priority:"P1", task:"Launch EDM + WhatsApp blast to database", owner:"CI + NSH", depends:"Approved", notes:"" },
  { offset:  0, label:"Launch",  phase:"Launch",       team:"BOTH",  priority:"P2", task:"Coordinate with partner for cross-amplification on their channels", owner:"TD", depends:"—", notes:"Free reach — align posts/timing." },
  { offset:  3, label:"+3 days", phase:"Follow-up",    team:"MKT",   priority:"P2", task:"Sustain — follow-up posts explaining the benefit", owner:"CI", depends:"—", notes:"Reinforce 'what it means for you'." },
  { offset:  7, label:"+1 wk",   phase:"Review",       team:"BOTH",  priority:"P2", task:"Review launch reach/engagement; capture enquiries in GHL", owner:"TD + NSH", depends:"Analytics", notes:"" },
]

export const TASK_SETS = {
  showcase: SHOWCASE_TASKS, promo: PROMO_TASKS, campaign: CAMPAIGN_TASKS,
  nurture: NURTURE_TASKS, launch: LAUNCH_TASKS,
}
export function getTasks(cat) { return TASK_SETS[cat] || SHOWCASE_TASKS }

// ─── SHOWCASE COLLATERAL (full set) ──────────────────────────────────────────
const SHOWCASE_COLLATERAL = [
  { name:"Event Key Visual / Theme Artwork",       type:"Design",        designOff:-49, pubOff:-49, owner:"TD + DES",  reuse:true,  note:"Foundation for all other assets." },
  { name:"Save-the-Date / E-invite",               type:"Digital",       designOff:-42, pubOff:-42, owner:"CI + DES",  reuse:true,  note:"For Sales to send to warm leads." },
  { name:"Event Banner (digital)",                 type:"Digital",       designOff:-42, pubOff:-35, owner:"CI + DES",  reuse:false, note:"Resize for TikTok, IG, FB, Story." },
  { name:"Booth Backdrop (print)",                 type:"Print",         designOff:-42, pubOff:-35, owner:"TD + DES",  reuse:false, note:"⚠️ Min 10 working days after approval." },
  { name:"Physical Pull-up Banner (print)",        type:"Print",         designOff:-42, pubOff:-35, owner:"TD + DES",  reuse:false, note:"Confirm quantity with NSH." },
  { name:"Partner Vendor Co-Branded Posts",        type:"Digital",       designOff:-35, pubOff:-35, owner:"CI",        reuse:true,  note:"Collect logos first. Vendor approves." },
  { name:"Package Brochure / Price Guide",         type:"Print",         designOff:-42, pubOff:-28, owner:"NSH + CI",  reuse:false, note:"Tania approves copy." },
  { name:"Social Media Post Pack (all phases)",    type:"Digital",       designOff:-35, pubOff:-28, owner:"CI",        reuse:true,  note:"Full content set ~10–14 working days." },
  { name:"Landing Page / RSVP Form",               type:"Digital",       designOff:-35, pubOff:-35, owner:"CI + TD",   reuse:true,  note:"Lead destination — live & tested before ads." },
  { name:"EDM Templates ×4",                       type:"Digital",       designOff:-35, pubOff:-35, owner:"CI",        reuse:true,  note:"Showcase EDM ~10–14 working days." },
  { name:"Meta Ad — Awareness",                    type:"Meta Ad",       designOff:-42, pubOff:-28, owner:"CI + DES",  reuse:true,  meta:true, note:"Reach / video views. Reuse KV." },
  { name:"Meta Ad — Lead Gen (RSVP)",              type:"Meta Ad",       designOff:-28, pubOff:-21, owner:"CI",        reuse:false, meta:true, note:"Lookalike of GHL leads." },
  { name:"Meta Ad — Retargeting / Final Push",     type:"Meta Ad",       designOff:-21, pubOff:-14, owner:"CI",        reuse:true,  meta:true, note:"Countdown. Pause at event end." },
  { name:"Meta Ad — Post-Event (recap)",           type:"Meta Ad",       designOff:0,   pubOff:2,   owner:"CI + TD",   reuse:false, meta:true, note:"Reuse the recap reel." },
  { name:"SEM / Google Search Ads",                type:"SEM",           designOff:-35, pubOff:-21, owner:"CI",        reuse:false, meta:true, note:"High-intent keywords." },
  { name:"TikTok / Reels BTS Teaser",              type:"Video",         designOff:-21, pubOff:-21, owner:"CI + TD",   reuse:false, note:"30–60s. Hook in 2s." },
  { name:"Countdown Stories (batch)",              type:"Digital",       designOff:-14, pubOff:null,owner:"CI",        reuse:false, note:"Schedule daily countdown." },
  { name:"On-Site Signage & Directional",          type:"Print",         designOff:-21, pubOff:-14, owner:"CI + DES",  reuse:false, note:"Confirm venue permits signs." },
  { name:"Booth Giveaways / Branded Items",        type:"Physical",      designOff:-21, pubOff:-14, owner:"NSH + TD",  reuse:false, note:"Budget approval from Shermen." },
  { name:"Lead Capture QR Code Sheets",            type:"Digital/Print", designOff:-7,  pubOff:-3,  owner:"CI",        reuse:true,  note:"Test QR before printing." },
  { name:"On-the-Day Content Shot List",           type:"Brief",         designOff:-7,  pubOff:-3,  owner:"CI + TD",   reuse:false, note:"Photo + Reels plan." },
  { name:"Post-Event Recap Reel",                  type:"Video",         designOff:0,   pubOff:2,   owner:"CI + TD",   reuse:false, note:"Within 48 hrs. Doubles as ad." },
  { name:"EDM #4 — Thank-You + Follow-Up",         type:"Digital",       designOff:3,   pubOff:7,   owner:"CI + NSH",  reuse:false, note:"Personalised for Hot leads." },
]

// ─── PROMO / FLASH COLLATERAL (lean) ─────────────────────────────────────────
const PROMO_COLLATERAL = [
  { name:"Flash Offer Tile (feed post)",     type:"Digital",  designOff:-14, pubOff:0,  owner:"CI + DES", reuse:false, note:"The offer is the hero. Clear deadline." },
  { name:"Flash Reel (15s)",                 type:"Video",    designOff:-14, pubOff:0,  owner:"CI",       reuse:false, note:"Hook + offer + deadline in 15s." },
  { name:"Countdown Stories (batch)",        type:"Digital",  designOff:-10, pubOff:-3, owner:"CI",       reuse:false, note:"Tease → live → '48h left' → final." },
  { name:"Countdown / Offer Landing Page",   type:"Digital",  designOff:-12, pubOff:-3, owner:"CI + TD",  reuse:true,  note:"Optional — or send straight to WhatsApp." },
  { name:"Flash EDM",                        type:"Digital",  designOff:-12, pubOff:0,  owner:"CI",       reuse:false, note:"Short, urgent, deadline-led." },
  { name:"WhatsApp Blast Template",          type:"Digital",  designOff:-12, pubOff:0,  owner:"CI + NSH", reuse:true,  note:"Personalised to warm list." },
  { name:"Retargeting Meta Ad",              type:"Meta Ad",  designOff:-12, pubOff:-3, owner:"CI",       reuse:false, meta:true, note:"Warm audiences only — not cold." },
]

// ─── CAMPAIGN COLLATERAL (digital-only) ──────────────────────────────────────
const CAMPAIGN_COLLATERAL = [
  { name:"Campaign Key Visual",              type:"Design",   designOff:-25, pubOff:-25, owner:"TD + DES", reuse:true,  note:"Sets the look for the content set." },
  { name:"Content Carousels ×3",             type:"Digital",  designOff:-21, pubOff:-14, owner:"CI + DES", reuse:true,  note:"Educational / inspirational angles." },
  { name:"Campaign Reels ×2",                type:"Video",    designOff:-21, pubOff:-14, owner:"CI",       reuse:false, note:"Hook-led, emotional entry points." },
  { name:"Lead-Gen Meta Ad",                 type:"Meta Ad",  designOff:-21, pubOff:-14, owner:"CI",       reuse:false, meta:true, note:"→ lead form / landing page." },
  { name:"Landing Page / Lead Form",         type:"Digital",  designOff:-21, pubOff:-14, owner:"CI + TD",  reuse:true,  note:"Live before ads." },
  { name:"EDM ×2 (open + flagship)",         type:"Digital",  designOff:-18, pubOff:-14, owner:"CI",       reuse:false, note:"Tue/Wed AM sends." },
  { name:"WhatsApp Nurture Templates",       type:"Digital",  designOff:-18, pubOff:-14, owner:"CI + NSH", reuse:true,  note:"Enquiry → consultation journey." },
  { name:"Stories Set",                      type:"Digital",  designOff:-14, pubOff:-14, owner:"CI",       reuse:false, note:"Polls, Q&A, behind-the-scenes." },
  { name:"Mid-Campaign Content Wave",        type:"Digital",  designOff:-12, pubOff:-10, owner:"CI",       reuse:false, note:"Keeps cadence mid-flight." },
]

// ─── NURTURE COLLATERAL (Ramadan — minimal, no ads/promo) ────────────────────
const NURTURE_COLLATERAL = [
  { name:"Reflective Carousel Set",          type:"Digital",  designOff:-28, pubOff:-30, owner:"CI + DES", reuse:false, note:"Marriage as ibadah, intention, du'a." },
  { name:"Soft Nurture Reels",               type:"Video",    designOff:-28, pubOff:-25, owner:"CI",       reuse:false, note:"Gentle, no hard CTA." },
  { name:"Ramadan EDM ×2 (reflection)",      type:"Digital",  designOff:-25, pubOff:-18, owner:"CI",       reuse:false, note:"Values-led. 'Save/share' only." },
  { name:"Post-Raya Re-engagement WhatsApp", type:"Digital",  designOff:-7,  pubOff:2,   owner:"CI + NSH", reuse:true,  note:"Soft consultation invite after Raya." },
  { name:"Du'a / Values Story Templates",    type:"Digital",  designOff:-25, pubOff:-30, owner:"CI",       reuse:false, note:"Daily/weekly gentle Stories." },
]

// ─── LAUNCH COLLATERAL (with partner-approved assets) ────────────────────────
const LAUNCH_COLLATERAL = [
  { name:"⚠️ Partner-Approved Logos/Assets", type:"Brand",    designOff:-18, pubOff:-12, owner:"TD",       reuse:true,  note:"Obtain from Advocado/yuu. Don't DIY." },
  { name:"Launch Announcement Reel",         type:"Video",    designOff:-14, pubOff:0,   owner:"CI + DES", reuse:false, note:"'We've got news' — benefit-led." },
  { name:"Launch Explainer Carousel",        type:"Digital",  designOff:-14, pubOff:0,   owner:"CI + DES", reuse:true,  note:"What it means for the customer." },
  { name:"Launch Stories Set",               type:"Digital",  designOff:-12, pubOff:0,   owner:"CI",       reuse:false, note:"Announcement + 'tell me more' sticker." },
  { name:"Launch EDM",                       type:"Digital",  designOff:-12, pubOff:0,   owner:"CI",       reuse:false, note:"Announce + explain + CTA." },
  { name:"Launch WhatsApp Blast",            type:"Digital",  designOff:-12, pubOff:0,   owner:"CI + NSH", reuse:true,  note:"To existing leads." },
  { name:"Landing Page Module (partner)",    type:"Digital",  designOff:-12, pubOff:0,   owner:"CI + TD",  reuse:true,  note:"Add to main site. Partner-approved." },
]

export const COLLATERAL_SETS = {
  showcase: SHOWCASE_COLLATERAL, promo: PROMO_COLLATERAL, campaign: CAMPAIGN_COLLATERAL,
  nurture: NURTURE_COLLATERAL, launch: LAUNCH_COLLATERAL,
}
export function getCollateral(cat) { return COLLATERAL_SETS[cat] || SHOWCASE_COLLATERAL }

// ─── BACKWARD-COMPATIBLE EXPORTS (so the app keeps working before App.jsx update) ───
export const TASKS = SHOWCASE_TASKS
export const COLLATERAL_ITEMS = SHOWCASE_COLLATERAL
