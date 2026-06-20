import { useState, useEffect } from "react"
import { createClient } from '@supabase/supabase-js'

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ─── COLOUR HELPERS ───────────────────────────────────────────────────────────
const TEAM = {
  MKT:   { bg:"bg-blue-50",   badge:"bg-blue-800 text-white",  label:"🔵 Marketing" },
  SALES: { bg:"bg-teal-50",   badge:"bg-teal-700 text-white",  label:"🟢 Sales" },
  TANIA: { bg:"bg-amber-50",  badge:"bg-amber-600 text-white", label:"🟡 Tania" },
  BOTH:  { bg:"bg-purple-50", badge:"bg-purple-700 text-white",label:"🟣 Both" },
}
const PH_COLOUR = {
  "Plan & Brief":"bg-blue-900", Collateral:"bg-teal-700",
  Launch:"bg-blue-700",         "Build-up":"bg-green-700",
  "Final Push":"bg-orange-600", "Event Day":"bg-red-700",
  "Follow-up":"bg-purple-700",  Review:"bg-green-600",
}
const PRI = {
  P1:"bg-red-100 text-red-800 font-bold",
  P2:"bg-orange-100 text-orange-800",
  P3:"bg-green-100 text-green-800",
}
const STATUS_OPTS = ["Not Started","In Progress","Done","Blocked","Urgent","N/A"]
const STATUS_COL = {
  "Not Started":"bg-gray-100 text-gray-600",
  "In Progress":"bg-blue-100 text-blue-800",
  "Done":"bg-green-100 text-green-800",
  "Blocked":"bg-red-100 text-red-800",
  "Urgent":"bg-orange-100 text-orange-800",
  "N/A":"bg-gray-50 text-gray-400",
}

// ─── SOP CONSTANTS ────────────────────────────────────────────────────────────
const OBJECTIVES = [
  "Increase wedding enquiries","Push a specific venue","Promote selected dates",
  "Drive showcase registrations","Convert old leads","Increase appointments",
  "Promote a new package","Collect deposits","Fill low-demand months",
  "Promote food tasting","Retarget warm leads",
]
const LEAD_TIMES = [
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

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
function addDays(iso, n) {
  if (!iso) return null
  const d = new Date(iso); d.setDate(d.getDate() + n); return d
}
function fmtDate(d) {
  if (!d) return "—"
  if (typeof d === "string") d = new Date(d)
  return d.toLocaleDateString("en-SG", { day:"numeric", month:"short", year:"numeric" })
}
function daysFromToday(target) {
  if (!target) return null
  const a = new Date(); a.setHours(0,0,0,0)
  const b = new Date(target); b.setHours(0,0,0,0)
  return Math.round((b - a) / 86400000)
}
function isoDate(d) {
  if (!d) return ""
  if (typeof d === "string") d = new Date(d)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
}
function recommendGoLive(startISO) {
  return startISO ? isoDate(addDays(startISO, -28)) : ""
}

// ─── IMAGE COMPRESSION ────────────────────────────────────────────────────────
function compressImage(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let w = img.width, h = img.height
        if (w >= h && w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim }
        else if (h > w && h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim }
        const canvas = document.createElement("canvas")
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext("2d")
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,w,h)
        ctx.drawImage(img,0,0,w,h)
        try { resolve(canvas.toDataURL("image/jpeg", quality)) }
        catch(err) { reject(err) }
      }
      img.onerror = reject; img.src = reader.result
    }
    reader.onerror = reject; reader.readAsDataURL(file)
  })
}

// ─── TASK DATA ────────────────────────────────────────────────────────────────
const TASKS = [
  { offset:-56, label:"-8 wks",  phase:"Plan & Brief", team:"BOTH",  priority:"P1", task:"Marketing–Sales kickoff: confirm objective, hero offer, audience, partner vendors", owner:"TD + NSH", depends:"Venue/date confirmed", notes:"Output: completed Sales brief. Lock offer before outreach." },
  { offset:-56, label:"-8 wks",  phase:"Plan & Brief", team:"SALES", priority:"P1", task:"Complete the Sales→Marketing brief: objective, audience, offer, CTA, lead destination", owner:"NSH", depends:"Kickoff done", notes:"Per SOP: Marketing should not have to guess pricing or package mechanics." },
  { offset:-56, label:"-8 wks",  phase:"Plan & Brief", team:"SALES", priority:"P1", task:"Pull warm lead list from GHL — filter active enquiries for VIP invitations", owner:"NSH", depends:"Kickoff done", notes:"Segment by date interest, package tier, recency." },
  { offset:-49, label:"-7 wks",  phase:"Plan & Brief", team:"SALES", priority:"P1", task:"Define event-exclusive offer — confirm with Shermen + Tania before any outreach", owner:"NSH + SHR → Tania", depends:"Budget sign-off", notes:"Specific, time-limited offer only. Management approves promo pricing + ad budget." },
  { offset:-49, label:"-7 wks",  phase:"Plan & Brief", team:"MKT",   priority:"P1", task:"Finalise creative concept, theme direction & key visual (KV)", owner:"TD", depends:"Décor direction from NSH; brief complete", notes:"KV is the basis for all other assets. Tania approves before designer starts." },
  { offset:-49, label:"-7 wks",  phase:"Plan & Brief", team:"TANIA", priority:"P1", task:"APPROVAL: Key visual & creative concept", owner:"Tania", depends:"KV draft from Marketing", notes:"Nothing goes to production without this sign-off." },
  { offset:-49, label:"-7 wks",  phase:"Plan & Brief", team:"SALES", priority:"P1", task:"Confirm staffing roster — who attends, which days, arrival times", owner:"NSH", depends:"Kickoff done", notes:"For multi-day events: stagger NSH + LLA. Assign booth lead per day." },
  { offset:-42, label:"-6 wks",  phase:"Collateral",   team:"MKT",   priority:"P1", task:"Design: event banner, e-invite, booth backdrop & all print collateral", owner:"TD + DES", depends:"KV approved by Tania; venue dimensions confirmed", notes:"⚠️ Allow min 10 working days for print after approval." },
  { offset:-42, label:"-6 wks",  phase:"Collateral",   team:"MKT",   priority:"P1", task:"Partner vendor co-branded assets — request logos & draft co-branded posts", owner:"CI", depends:"Partner vendor list from Sales", notes:"Give vendors 1 week. Chase at day 5. Nothing posts without vendor sign-off." },
  { offset:-42, label:"-6 wks",  phase:"Collateral",   team:"MKT",   priority:"P1", task:"Meta ad creatives — design ad set (awareness, lead gen, retargeting)", owner:"CI + DES", depends:"KV approved by Tania", notes:"SOP: full multi-ad-set campaign needs ~14 working days." },
  { offset:-42, label:"-6 wks",  phase:"Collateral",   team:"SALES", priority:"P1", task:"Prepare/update package brochures and price guides for booth handout", owner:"NSH + TD", depends:"2027 pricing approved by Shermen", notes:"Tania approves all pricing copy before print." },
  { offset:-42, label:"-6 wks",  phase:"Collateral",   team:"TANIA", priority:"P1", task:"APPROVAL: All print collateral + Meta ad creatives before print/launch", owner:"Tania", depends:"Collateral drafts from Marketing + Sales", notes:"Nothing goes to print or Ads Manager without Tania sign-off. Allow 48hr." },
  { offset:-35, label:"-5 wks",  phase:"Collateral",   team:"MKT",   priority:"P1", task:"Landing page / RSVP form live — connected to GHL for lead capture", owner:"CI + TD", depends:"Sales to confirm capacity/max RSVP", notes:"Lead destination must be ready BEFORE ads go live. Test → GHL first." },
  { offset:-35, label:"-5 wks",  phase:"Collateral",   team:"MKT",   priority:"P2", task:"All 4 EDM templates drafted (Save the Date / Reminder / Final Push / Thank-You)", owner:"CI", depends:"Event programme confirmed", notes:"Write all 4 at once. Tania approves all before any are sent." },
  { offset:-35, label:"-5 wks",  phase:"Collateral",   team:"TANIA", priority:"P1", task:"APPROVAL: Landing page copy + all 4 EDM templates", owner:"Tania", depends:"Drafts from CI", notes:"Approve before CI schedules sends in GHL." },
  { offset:-35, label:"-5 wks",  phase:"Collateral",   team:"SALES", priority:"P1", task:"Send personalised VIP invitations to warm lead list — WhatsApp + EDM #1", owner:"NSH + LLA", depends:"Lead list pulled; RSVP link live", notes:"Personalise by name. Reference their specific enquiry. Not a mass blast." },
  { offset:-28, label:"-4 wks",  phase:"Launch",       team:"BOTH",  priority:"P1", task:"PRE-LAUNCH check: confirm offer, audience, lead destination & approvals before going live", owner:"NSH + TD → Tania", depends:"Brief complete; lead destination ready", notes:"Confirm brief is complete and Tania has signed off creatives before going live." },
  { offset:-28, label:"-4 wks",  phase:"Launch",       team:"MKT",   priority:"P1", task:"Announcement post + Meta awareness ads live — 'Save the Date'", owner:"CI", depends:"Pre-launch check cleared; ad creatives approved by Tania", notes:"Organic across IG/FB/TikTok + paid awareness set in Ads Manager." },
  { offset:-28, label:"-4 wks",  phase:"Launch",       team:"TANIA", priority:"P1", task:"APPROVAL: Announcement post (social) before it goes live", owner:"Tania", depends:"Draft from CI", notes:"First public-facing post for the event. Must be approved." },
  { offset:-28, label:"-4 wks",  phase:"Launch",       team:"MKT",   priority:"P1", task:"EDM #1 broadcast to existing lead database (Save the Date)", owner:"CI", depends:"Template approved; lead list confirmed", notes:"Send Tue or Wed morning. Include RSVP link with click tracking." },
  { offset:-28, label:"-4 wks",  phase:"Launch",       team:"SALES", priority:"P2", task:"First follow-up on VIP invites — WhatsApp check-in with non-responders", owner:"LLA", depends:"VIP invites sent at -5 wks", notes:"'Checking you saw our message — we'd love to reserve a consultation slot.'" },
  { offset:-21, label:"-3 wks",  phase:"Build-up",     team:"MKT",   priority:"P2", task:"Vendor spotlight series — 1 post per vendor, 2–3x per week", owner:"CI", depends:"Vendor assets and logos received", notes:"Ask vendors to reshare — expands to their audiences." },
  { offset:-21, label:"-3 wks",  phase:"Build-up",     team:"MKT",   priority:"P1", task:"Launch Meta lead-gen ad set + SEM campaign (if briefed) — RSVP / free consultation", owner:"CI", depends:"Lead ad creative approved; RSVP form live", notes:"Lookalike of converted GHL leads. SEM for high-intent venue/package searches." },
  { offset:-21, label:"-3 wks",  phase:"Build-up",     team:"MKT",   priority:"P2", task:"TikTok / Reels teaser — BTS of décor setup or booth build (30–60s)", owner:"CI + TD", depends:"Décor finalised; booth access confirmed", notes:"Hook in first 2 seconds." },
  { offset:-21, label:"-3 wks",  phase:"Build-up",     team:"MKT",   priority:"P1", task:"EDM #2 — event reminder with agenda, vendors & perks", owner:"CI", depends:"Confirmed event programme from Sales", notes:"Send Tue or Wed morning. Include agenda, vendor previews, consultation link." },
  { offset:-21, label:"-3 wks",  phase:"Build-up",     team:"SALES", priority:"P1", task:"Set up on-site consultation booking system (pre-book or walk-in queue)", owner:"NSH", depends:"Booth layout confirmed; roster finalised", notes:"20-min slots, max 4/hour per consultant." },
  { offset:-21, label:"-3 wks",  phase:"Build-up",     team:"SALES", priority:"P1", task:"Confirm lead-response SLAs with the team (per SOP)", owner:"NSH", depends:"Consultants assigned", notes:"WhatsApp 15–30 min, Meta lead form 1–2 hrs, RSVP within 24 hrs." },
  { offset:-21, label:"-3 wks",  phase:"Build-up",     team:"SALES", priority:"P1", task:"Pack booth kit: brochures, QR sheets, pens, giveaways, business cards", owner:"NSH + LLA", depends:"Print collateral delivered by Marketing", notes:"Count everything. Print 20% more than RSVP for walk-ins." },
  { offset:-14, label:"-2 wks",  phase:"Final Push",   team:"MKT",   priority:"P1", task:"Countdown Stories + Meta retargeting/final-push ads — run until event day", owner:"CI", depends:"Final RSVP count from Sales; retargeting creative approved", notes:"Retarget engagers + non-converters. Pause ad set at event end." },
  { offset:-14, label:"-2 wks",  phase:"Final Push",   team:"MKT",   priority:"P1", task:"EDM #3 + WhatsApp blast — final reminder with venue directions and parking", owner:"CI + NSH", depends:"Final guest list; venue map + parking confirmed", notes:"Include: address, parking, what to bring, consultation slot reminder." },
  { offset:-14, label:"-2 wks",  phase:"Final Push",   team:"TANIA", priority:"P1", task:"APPROVAL: EDM #3 and WhatsApp blast copy before send", owner:"Tania", depends:"Draft from CI", notes:"Last pre-event comms to all guests. Must be approved." },
  { offset:-14, label:"-2 wks",  phase:"Final Push",   team:"SALES", priority:"P1", task:"Final follow-up call/WhatsApp to VIPs who haven't RSVP'd", owner:"NSH + LLA", depends:"VIP RSVP status from GHL", notes:"'We've reserved a consultation slot — just confirm to hold it.'" },
  { offset:-14, label:"-2 wks",  phase:"Final Push",   team:"SALES", priority:"P1", task:"All-staff briefing: arrival times, roles, talking points, hero offer, booth layout", owner:"NSH", depends:"Booth layout confirmed; hero offer approved by Tania", notes:"Everyone must know: the offer, the package to pitch, when to escalate to NSH." },
  { offset: -7, label:"-1 wk",   phase:"Final Push",   team:"MKT",   priority:"P2", task:"Final social push — last 3 posts: excitement, vendor preview, 'see you there'", owner:"CI", depends:"—", notes:"" },
  { offset: -7, label:"-1 wk",   phase:"Final Push",   team:"SALES", priority:"P1", task:"Print all final materials; check quantities vs expected RSVP count", owner:"LLA", depends:"Print collateral from Marketing; confirmed RSVP", notes:"Print 20% more than RSVP. Keep spares in a separate box." },
  { offset: -7, label:"-1 wk",   phase:"Final Push",   team:"SALES", priority:"P1", task:"GHL pipeline: create event source tag; confirm all RSVPs are in the pipeline", owner:"NSH", depends:"RSVP list closed", notes:"Tag: [Event Name] RSVP. This is how post-event follow-up is tracked." },
  { offset: -3, label:"-3 days", phase:"Final Push",   team:"BOTH",  priority:"P1", task:"All-team confirmation: every staff confirms attendance, arrival time, role", owner:"NSH + TD", depends:"—", notes:"Share: venue address, parking, arrival time, NSH mobile as emergency contact." },
  { offset: -3, label:"-3 days", phase:"Final Push",   team:"SALES", priority:"P1", task:"Pack and transport all booth materials (or stage for event day morning)", owner:"NSH + LLA", depends:"All collateral checked and counted", notes:"Sign off a physical checklist of everything in the booth kit." },
  { offset: -1, label:"-1 day",  phase:"Final Push",   team:"SALES", priority:"P1", task:"Prepare lead capture kit: QR sheets printed, pens, forms, backup paper sign-up", owner:"LLA", depends:"QR code tested and confirmed working", notes:"Test the QR on your phone tonight. Bring a backup manual form." },
  { offset: -1, label:"-1 day",  phase:"Final Push",   team:"TANIA", priority:"P2", task:"APPROVAL: Final shot list and any last-minute posts scheduled", owner:"Tania", depends:"Shot list + scheduled posts from CI", notes:"Final check before event day." },
  { offset:  0, label:"Event",   phase:"Event Day",    team:"SALES", priority:"P1", task:"Arrive early — booth setup, signage check, QR codes visible and tested", owner:"NSH + LLA", depends:"All materials packed", notes:"Arrive min 90 min before open. Confirm power + Wi-Fi with venue." },
  { offset:  0, label:"Event",   phase:"Event Day",    team:"MKT",   priority:"P1", task:"On-site content: Live Stories (2–3x at peak), B-roll, couple reactions", owner:"CI (on-site)", depends:"Sales running booth; shot list confirmed", notes:"Check with Tania before posting ANYTHING live on the day." },
  { offset:  0, label:"Event",   phase:"Event Day",    team:"TANIA", priority:"P1", task:"APPROVAL: Any live post on event day before it publishes", owner:"Tania (on-site/WhatsApp)", depends:"Draft from CI", notes:"CI sends draft to Tania via WhatsApp. Nothing posts without a thumbs up." },
  { offset:  0, label:"Event",   phase:"Event Day",    team:"SALES", priority:"P1", task:"Run consultation slots — 20 min, capture all details in GHL on the day", owner:"NSH + LLA", depends:"Booking system set up", notes:"Flag HOT leads (specific date + budget mentioned) to NSH immediately." },
  { offset:  0, label:"Event",   phase:"Event Day",    team:"SALES", priority:"P1", task:"End of day: collect all lead forms, count materials, photograph booth", owner:"LLA", depends:"—", notes:"Pack-down. Nothing left at venue." },
  { offset:  2, label:"+2 days", phase:"Follow-up",    team:"MKT",   priority:"P1", task:"Thank-you post + recap Reel + Meta post-event ad — tag all partner vendors", owner:"CI + TD", depends:"Event photos + footage from on-site team", notes:"Recap Reel within 48 hrs. Reuse reel as post-event ad creative." },
  { offset:  2, label:"+2 days", phase:"Follow-up",    team:"TANIA", priority:"P1", task:"APPROVAL: Recap Reel and thank-you post before publishing", owner:"Tania", depends:"Drafts from CI", notes:"Fast turnaround — flag to Tania same night after event." },
  { offset:  2, label:"+2 days", phase:"Follow-up",    team:"SALES", priority:"P1", task:"Tier all leads: Hot / Warm / Cold. Upload all to GHL with event source tag.", owner:"NSH", depends:"All lead forms collected", notes:"Hot leads: call/WhatsApp within 48 hrs. All leads in GHL within 48 hrs." },
  { offset:  2, label:"+2 days", phase:"Follow-up",    team:"SALES", priority:"P1", task:"Call / WhatsApp ALL Hot leads — offer a consultation within 7 days", owner:"NSH + LLA", depends:"Hot lead list sorted", notes:"Reference the booth conversation. Offer 2–3 specific slots." },
  { offset:  7, label:"+1 wk",   phase:"Follow-up",    team:"MKT",   priority:"P1", task:"EDM #4 — thank-you + follow-up offer (tiered: Hot personalised, Warm standard)", owner:"CI + NSH", depends:"Tiered lead list from Sales; template approved by Tania", notes:"Hot leads get personalised version. Cold gets newsletter only." },
  { offset:  7, label:"+1 wk",   phase:"Follow-up",    team:"TANIA", priority:"P1", task:"APPROVAL: EDM #4 before send", owner:"Tania", depends:"Draft from CI", notes:"" },
  { offset:  7, label:"+1 wk",   phase:"Follow-up",    team:"SALES", priority:"P1", task:"Consultation schedule: book follow-up consultations with all Hot leads", owner:"NSH + LLA", depends:"Hot lead follow-ups done at +2 days", notes:"Target: all Hot leads have a consultation within 2 weeks of event." },
  { offset:  7, label:"+1 wk",   phase:"Follow-up",    team:"SALES", priority:"P1", task:"Sales report to Shermen + Tania: leads by tier, consultations, soft bookings", owner:"NSH", depends:"All leads in GHL; consultations scheduled", notes:"Cover: total leads, tier breakdown, event ROI estimate." },
  { offset: 14, label:"+2 wks",  phase:"Review",       team:"SALES", priority:"P1", task:"Close soft bookings — convert warm consultations to confirmed deposits", owner:"NSH + LLA", depends:"Consultation schedule from +1 wk", notes:"Every consultation lead should have a decision within 2 weeks." },
  { offset: 14, label:"+2 wks",  phase:"Review",       team:"BOTH",  priority:"P1", task:"Post-campaign review: reach, leads, cost/lead, best creative + conversions", owner:"TD + NSH + SHR", depends:"Marketing analytics + Sales conversion data", notes:"SOP: Marketing reports reach/leads/CPL/best creative; Sales reports enquiries→deposits." },
]

const COLLATERAL_ITEMS = [
  { name:"Event Key Visual / Theme Artwork",       type:"Design",        designOff:-49, pubOff:-49, owner:"TD + DES",  reuse:true,  note:"Foundation for all other assets — print, social and Meta ads." },
  { name:"Save-the-Date / E-invite",               type:"Digital",       designOff:-42, pubOff:-42, owner:"CI + DES",  reuse:true,  note:"For Sales to send to warm leads." },
  { name:"Event Banner (digital — social use)",    type:"Digital",       designOff:-42, pubOff:-35, owner:"CI + DES",  reuse:false, note:"Resize for TikTok, IG, FB, Story." },
  { name:"Booth Backdrop (print)",                 type:"Print",         designOff:-42, pubOff:-35, owner:"TD + DES",  reuse:false, note:"⚠️ Min 10 working days after approval." },
  { name:"Physical Pull-up Banner (print)",        type:"Print",         designOff:-42, pubOff:-35, owner:"TD + DES",  reuse:false, note:"Confirm quantity with NSH." },
  { name:"Partner Vendor Co-Branded Posts",        type:"Digital",       designOff:-35, pubOff:-35, owner:"CI",        reuse:true,  note:"Collect logos first. Vendor approves own co-brand." },
  { name:"Package Brochure / Price Guide",         type:"Print",         designOff:-42, pubOff:-28, owner:"NSH + CI",  reuse:false, note:"Pricing confirmed by NSH + SHR. Tania approves copy." },
  { name:"Social Media Post Pack (all phases)",    type:"Digital",       designOff:-35, pubOff:-28, owner:"CI",        reuse:true,  note:"Full content set: SOP ~10–14 working days." },
  { name:"Landing Page / RSVP Form",               type:"Digital",       designOff:-35, pubOff:-35, owner:"CI + TD",   reuse:true,  note:"Lead destination — must be live & tested before ads." },
  { name:"EDM Templates ×4",                       type:"Digital",       designOff:-35, pubOff:-35, owner:"CI",        reuse:true,  note:"Showcase EDM: SOP ~10–14 working days." },
  { name:"Meta Ad — Awareness (video / carousel)", type:"Meta Ad",       designOff:-42, pubOff:-28, owner:"CI + DES",  reuse:true,  meta:true, note:"Reach / video views. Reuse the KV." },
  { name:"Meta Ad — Lead Gen (RSVP lead ad)",      type:"Meta Ad",       designOff:-28, pubOff:-21, owner:"CI",        reuse:false, meta:true, note:"'Free consultation at [Event]'. Lookalike of GHL leads." },
  { name:"Meta Ad — Retargeting / Final Push",     type:"Meta Ad",       designOff:-21, pubOff:-14, owner:"CI",        reuse:true,  meta:true, note:"Countdown / 'Have you RSVP'd?' Pause at event end." },
  { name:"Meta Ad — Post-Event (recap reel)",      type:"Meta Ad",       designOff:0,   pubOff:2,   owner:"CI + TD",   reuse:false, meta:true, note:"'Missed us? Book a consultation.' Reuse the recap reel." },
  { name:"SEM / Google Search Ads (optional)",     type:"SEM",           designOff:-35, pubOff:-21, owner:"CI",        reuse:false, meta:true, note:"High-intent venue/package keywords. SOP 3–4 wks lead time." },
  { name:"TikTok / Reels BTS Teaser",              type:"Video",         designOff:-21, pubOff:-21, owner:"CI + TD",   reuse:false, note:"30–60s. Hook in first 2 seconds." },
  { name:"Countdown Stories (batch)",              type:"Digital",       designOff:-14, pubOff:null,owner:"CI",        reuse:false, note:"Create batch; schedule daily countdown." },
  { name:"On-Site Signage & Directional",          type:"Print",         designOff:-21, pubOff:-14, owner:"CI + DES",  reuse:false, note:"Confirm venue permits wayfinding signs." },
  { name:"Booth Giveaways / Branded Items",        type:"Physical",      designOff:-21, pubOff:-14, owner:"NSH + TD",  reuse:false, note:"Budget approval from Shermen required." },
  { name:"Lead Capture QR Code Sheets",            type:"Digital/Print", designOff:-7,  pubOff:-3,  owner:"CI",        reuse:true,  note:"Test QR before printing. Bring backup manual form." },
  { name:"On-the-Day Content Shot List",           type:"Brief",         designOff:-7,  pubOff:-3,  owner:"CI + TD",   reuse:false, note:"Photo + Reels plan for on-site team." },
  { name:"Post-Event Recap Reel",                  type:"Video",         designOff:0,   pubOff:2,   owner:"CI + TD",   reuse:false, note:"Publish within 48 hrs. Tag all vendors. Doubles as post-event ad." },
  { name:"EDM #4 — Thank-You + Follow-Up Offer",   type:"Digital",       designOff:3,   pubOff:7,   owner:"CI + NSH",  reuse:false, note:"Personalised for Hot leads; standard for Warm." },
]

// ─── STORAGE HELPERS (Supabase) ───────────────────────────────────────────────
async function loadStorage(key, fallback) {
  try {
    const { data, error } = await supabase.from('lsw_tracker').select('value').eq('key', key).single()
    if (error || !data) return fallback
    return JSON.parse(data.value)
  } catch { return fallback }
}
async function saveStorage(key, val) {
  try {
    await supabase.from('lsw_tracker').upsert(
      { key, value: JSON.stringify(val), updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
  } catch {}
}
async function persistArtwork(eventId, obj) {
  try {
    await supabase.from('lsw_tracker').upsert(
      { key: `lsw-art:${eventId}`, value: JSON.stringify(obj), updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
  } catch {}
}
async function deleteArtwork(eventId) {
  try { await supabase.from('lsw_tracker').delete().eq('key', `lsw-art:${eventId}`) } catch {}
}
async function loadAllArtwork() {
  const map = {}
  try {
    const { data } = await supabase.from('lsw_tracker').select('key, value').like('key', 'lsw-art:%')
    if (data) data.forEach(row => {
      const id = row.key.replace('lsw-art:', '')
      try { map[id] = JSON.parse(row.value) } catch {}
    })
  } catch {}
  return map
}

// ─── ARTWORK CELL ─────────────────────────────────────────────────────────────
function ArtworkCell({ art = {}, onUpload, onLink, onClear, onView }) {
  const [showLink, setShowLink] = useState(false)
  const [linkVal, setLinkVal] = useState(art.link || "")
  const [busy, setBusy] = useState(false)
  useEffect(() => { setLinkVal(art.link || "") }, [art.link])

  const handleFile = async (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    if (!f.type || !f.type.startsWith("image/")) { alert("Please choose an image file (JPG or PNG)."); e.target.value = ""; return }
    setBusy(true)
    try {
      const dataUrl = await compressImage(f, 480, 0.5)
      if (dataUrl.length > 3000000) {
        alert("Image still too large. Use a smaller file or paste a Google Drive link instead.")
      } else { onUpload(dataUrl, f.name) }
    } catch { alert("Couldn't process that image. Try another file or use a Drive link.") }
    setBusy(false); e.target.value = ""
  }
  const saveLink = () => { onLink((linkVal || "").trim()); setShowLink(false) }

  return (
    <div className="flex flex-col gap-1 items-center w-24">
      {art.img ? (
        <div className="relative">
          <img src={art.img} alt="ref" onClick={() => onView(art)}
            className="w-14 h-14 object-cover rounded border border-gray-300 cursor-pointer" />
          <button onClick={onClear} className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 text-xs leading-none flex items-center justify-center hover:bg-red-700">✕</button>
        </div>
      ) : (
        <label className="w-14 h-14 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 text-gray-400">
          <span className="text-lg leading-none">{busy ? "…" : "＋"}</span>
          <span className="text-xs">{busy ? "loading" : "Upload"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
      )}
      {art.img && (
        <label className="text-xs text-blue-600 cursor-pointer hover:underline">replace
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
      )}
      {art.link ? (
        <div className="flex items-center gap-1">
          <a href={art.link} target="_blank" rel="noreferrer" className="text-xs text-teal-700 hover:underline">📂 Drive</a>
          <button onClick={() => setShowLink(s => !s)} className="text-xs text-gray-400 hover:text-gray-700">edit</button>
        </div>
      ) : (
        <button onClick={() => setShowLink(s => !s)} className="text-xs text-gray-400 hover:text-teal-700">🔗 Drive link</button>
      )}
      {showLink && (
        <div className="flex flex-col gap-1">
          <input value={linkVal} onChange={e => setLinkVal(e.target.value)} placeholder="Paste Drive link"
            className="border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-400" />
          <div className="flex gap-1 justify-center">
            <button onClick={saveLink} className="bg-teal-700 text-white rounded px-2 py-0.5 text-xs hover:bg-teal-600">Save</button>
            <button onClick={() => { setLinkVal(art.link || ""); setShowLink(false) }} className="text-xs text-gray-400">cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("events")
  const [events, setEvents] = useState([])
  const [taskStatus, setTaskStatus] = useState({})
  const [collStatus, setCollStatus] = useState({})
  const [metaFlag, setMetaFlag] = useState({})
  const [artwork, setArtwork] = useState({})
  const [lightbox, setLightbox] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editEvt, setEditEvt] = useState(null)
  const [form, setForm] = useState(blankForm())
  const [expandedPhases, setExpandedPhases] = useState({})
  const [expandedEvents, setExpandedEvents] = useState({})

  function blankForm() {
    return { name:"", startDate:"", endDate:"", goLiveDate:"", type:"", venue:"", status:"Confirmed",
      salesLead:"Neshah (NSH)", marketingLead:"Tania (TD)", heroOffer:"", vendors:"", notes:"",
      objective:"", audience:"", sellingPoint:"", cta:"", leadDest:"", bookingDeadline:"" }
  }

  useEffect(() => {
    (async () => {
      const [ev, ts, cs, mf, art] = await Promise.all([
        loadStorage("lsw-events", []),
        loadStorage("lsw-task-status", {}),
        loadStorage("lsw-coll-status", {}),
        loadStorage("lsw-meta-flag", {}),
        loadAllArtwork(),
      ])
      setEvents(ev); setTaskStatus(ts); setCollStatus(cs); setMetaFlag(mf); setArtwork(art)
      setLoaded(true)
    })()
  }, [])

  useEffect(() => {
    if (!loaded) return
    setSaving(true)
    const t = setTimeout(async () => {
      await Promise.all([
        saveStorage("lsw-events", events),
        saveStorage("lsw-task-status", taskStatus),
        saveStorage("lsw-coll-status", collStatus),
        saveStorage("lsw-meta-flag", metaFlag),
      ])
      setSaving(false)
    }, 800)
    return () => clearTimeout(t)
  }, [events, taskStatus, collStatus, metaFlag, loaded])

  const togglePhase = k => setExpandedPhases(p => ({ ...p, [k]: !p[k] }))
  const toggleEvent = k => setExpandedEvents(p => ({ ...p, [k]: !p[k] }))
  const openAdd = () => { setForm(blankForm()); setEditEvt(null); setAddOpen(true) }
  const openEdit = ev => { setForm({ ...blankForm(), ...ev }); setEditEvt(ev.id); setAddOpen(true) }
  const saveEvent = () => {
    if (!form.name || !form.startDate) return
    const newEv = { ...form, id: editEvt || Date.now().toString(), endDate: form.endDate || form.startDate }
    setEvents(prev => editEvt ? prev.map(e => e.id === editEvt ? newEv : e) : [...prev, newEv])
    setAddOpen(false)
  }
  const deleteEvent = id => {
    if (!confirm("Delete this event and all its tracking data?")) return
    setEvents(prev => prev.filter(e => e.id !== id))
    const strip = setter => setter(prev => { const n={...prev}; Object.keys(n).filter(k=>k.startsWith(id)).forEach(k=>delete n[k]); return n })
    strip(setTaskStatus); strip(setCollStatus); strip(setMetaFlag)
    setArtwork(prev => { const n={...prev}; delete n[id]; return n })
    deleteArtwork(id)
  }
  const setTS = (k,v) => setTaskStatus(p => ({...p,[k]:v}))
  const setCS = (k,v) => setCollStatus(p => ({...p,[k]:v}))
  const toggleMeta = k => setMetaFlag(p => ({...p,[k]:!p[k]}))
  const getArt = (eId,idx) => (artwork[eId] && artwork[eId].coll && artwork[eId].coll[idx]) || {}
  const updateArt = (eId,idx,patch) => {
    setArtwork(prev => {
      const cur = prev[eId] || { coll:{}, masterFolder:"" }
      let evArt
      if (idx === "masterFolder") evArt = { ...cur, masterFolder: patch }
      else { const sec = { ...(cur.coll||{}) }; sec[idx] = { ...(sec[idx]||{}), ...patch }; evArt = { ...cur, coll: sec } }
      queueMicrotask(() => persistArtwork(eId, evArt))
      return { ...prev, [eId]: evArt }
    })
  }

  if (!loaded) return <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">Loading tracker…</div>

  const tasksByPhase = {}
  TASKS.forEach((t,i) => { (tasksByPhase[t.phase] = tasksByPhase[t.phase] || []).push({...t, idx:i}) })

  const TABS = [
    { id:"events",     label:"📋 Event Master" },
    { id:"brief",      label:"📣 Brief & Planner" },
    { id:"timeline",   label:"📅 Timeline" },
    { id:"collateral", label:"🎨 Collateral & Creative" },
  ]
  const FORM_FIELDS = [
    ["Event Name *",              "name",           "text", "e.g. The Wedding Upmarket @ Suntec"],
    ["Start / Event Date *",      "startDate",      "date", ""],
    ["End Date",                  "endDate",        "date", "Same as start for single-day"],
    ["Campaign Go-Live Date",     "goLiveDate",     "date", "When ads/comms start — auto-recommended"],
    ["Type",                      "type",           "text", "e.g. Wedding Showcase / Open House / Bridal Fair"],
    ["Venue / Hall",              "venue",          "text", "e.g. Royal Hall, Bukit Timah"],
    ["Sales Lead",                "salesLead",      "text", "e.g. Neshah (NSH)"],
    ["Marketing Lead",            "marketingLead",  "text", "e.g. Tania (TD)"],
    ["Hero Offer / Showcase Perk","heroOffer",      "text", "e.g. Complimentary tasting for bookings signed at event"],
    ["Partner Vendors",           "vendors",        "text", "e.g. florist, media team, bridal partners"],
  ]
  const BRIEF_FIELDS = [
    ["Target Audience",           "audience",       "e.g. Newly engaged Muslim couples planning 2026–27"],
    ["Main Selling Point",        "sellingPoint",   "e.g. All-inclusive halal package, venue + catering + décor"],
    ["Call-to-Action",            "cta",            "e.g. RSVP for the showcase / WhatsApp to enquire"],
    ["Lead Destination",          "leadDest",       "e.g. Meta lead form → GHL / WhatsApp / RSVP landing page"],
    ["Booking Deadline / Validity","bookingDeadline","e.g. Event-only perk; deposit by 31 Aug 2026"],
  ]

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-sm">
      {/* Header */}
      <div className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-lg">
        <div>
          <div className="text-xs text-blue-300 font-medium tracking-wide">LAGUN SARI WEDDINGS & EVENTS</div>
          <div className="text-lg font-bold">✿ Showcase & Events Tracker</div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-1 rounded-full ${saving ? "bg-amber-500" : "bg-green-600"}`}>
            {saving ? "Saving…" : "✓ Saved"}
          </span>
          <span className="text-xs bg-blue-700 px-2 py-1 rounded">
            {events.length} event{events.length!==1?"s":""} · {events.length * TASKS.length} tasks tracked
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-blue-800 text-white px-6 py-2 flex flex-wrap gap-4 text-xs">
        {Object.entries(TEAM).map(([k,v]) => (
          <span key={k} className={`px-2 py-0.5 rounded-full ${v.badge}`}>{v.label}</span>
        ))}
        <span className="text-blue-300 ml-2">Priority: 🔴P1 = Critical  🟠P2 = Important  🟢P3 = Nice to have</span>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 flex gap-1 sticky top-0 z-20 shadow-sm">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab===t.id ? "border-blue-800 text-blue-900" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}>{t.label}</button>
        ))}
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 py-4">

        {/* ── EVENT MASTER ──────────────────────────────────────────────── */}
        {tab === "events" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-blue-900">Event Master List</h2>
                <p className="text-xs text-gray-500 mt-0.5">Add events here → every other tab auto-updates from the event date and brief</p>
              </div>
              <button onClick={openAdd} className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800">+ Add New Event</button>
            </div>

            {events.length === 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-8 text-center">
                <div className="text-3xl mb-2">✿</div>
                <div className="font-semibold text-amber-800">No events yet</div>
                <div className="text-sm text-amber-600 mt-1">Click 'Add New Event' to get started.</div>
              </div>
            )}

            <div className="space-y-3">
              {events.map((ev,i) => {
                const hasBrief = ev.objective||ev.audience||ev.sellingPoint||ev.cta||ev.leadDest
                const done = TASKS.filter((_,idx) => taskStatus[`${ev.id}-${idx}`]==="Done").length
                const pct = Math.round((done/TASKS.length)*100)
                return (
                  <div key={ev.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-blue-900 text-white px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs bg-blue-700 rounded px-2 py-0.5">Event {i+1}</span>
                        <span className="font-bold text-base">{ev.name}</span>
                        <span className="text-blue-300 text-xs">{ev.startDate === ev.endDate ? fmtDate(ev.startDate) : `${fmtDate(ev.startDate)} – ${fmtDate(ev.endDate)}`}</span>
                        {ev.goLiveDate && <span className="text-xs bg-blue-700 px-2 py-0.5 rounded">Go-live: {fmtDate(ev.goLiveDate)}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ev.status==="Confirmed"?"bg-green-100 text-green-800":ev.status==="Completed"?"bg-gray-200 text-gray-600":ev.status==="Cancelled"?"bg-red-100 text-red-700":"bg-amber-100 text-amber-800"}`}>{ev.status}</span>
                        <button onClick={() => openEdit(ev)} className="text-xs bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded">Edit</button>
                        <button onClick={() => deleteEvent(ev.id)} className="text-xs bg-red-700 hover:bg-red-600 px-3 py-1 rounded">Delete</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                      {[["Type",ev.type||"—"],["Venue",ev.venue||"—"],["Sales Lead",ev.salesLead||"—"],["Marketing Lead",ev.marketingLead||"—"],
                        ["Hero Offer",ev.heroOffer||"—"],["Partner Vendors",ev.vendors||"—"],["Objective",ev.objective||"—"],["Booking deadline",ev.bookingDeadline||"—"]
                      ].map(([label,val]) => (
                        <div key={label}>
                          <div className="text-xs text-gray-400 font-medium">{label}</div>
                          <div className="text-sm text-gray-800 mt-0.5">{val}</div>
                        </div>
                      ))}
                      {ev.notes && (
                        <div className="col-span-2 md:col-span-4">
                          <div className="text-xs text-gray-400 font-medium">Notes</div>
                          <div className="text-sm text-gray-800 mt-0.5">{ev.notes}</div>
                        </div>
                      )}
                    </div>
                    {hasBrief && (
                      <div className="px-4 pb-3">
                        <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div><span className="font-semibold text-teal-800">Audience:</span> {ev.audience||"—"}</div>
                          <div><span className="font-semibold text-teal-800">Selling point:</span> {ev.sellingPoint||"—"}</div>
                          <div><span className="font-semibold text-teal-800">CTA:</span> {ev.cta||"—"}</div>
                          <div><span className="font-semibold text-teal-800">Lead destination:</span> {ev.leadDest||"—"}</div>
                        </div>
                      </div>
                    )}
                    <div className="px-4 pb-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Timeline progress</span><span>{done}/{TASKS.length} tasks done</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all" style={{width:`${pct}%`}}/>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Add/Edit Modal */}
            {addOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-4">
                  <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between rounded-t-xl sticky top-0 z-10">
                    <span className="font-bold text-base">{editEvt ? "Edit Event" : "Add New Event"}</span>
                    <button onClick={() => setAddOpen(false)} className="text-blue-300 hover:text-white text-xl">✕</button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {FORM_FIELDS.map(([label, field, type, placeholder]) => (
                        <div key={field} className={field==="vendors"||field==="heroOffer"?"md:col-span-2":""}>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                          <input type={type} placeholder={placeholder} value={form[field]||""}
                            onChange={e => {
                              const val = e.target.value
                              setForm(p => {
                                const next = { ...p, [field]: val }
                                if (field === "startDate" && val && !p.goLiveDate) next.goLiveDate = recommendGoLive(val)
                                return next
                              })
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                          {field === "goLiveDate" && form.startDate && (
                            <div className="text-xs text-gray-400 mt-1">
                              Recommended: <span className="font-semibold text-gray-600">{fmtDate(recommendGoLive(form.startDate))}</span> — 4 weeks before event.
                              {form.goLiveDate !== recommendGoLive(form.startDate) && (
                                <button type="button" onClick={() => setForm(p => ({ ...p, goLiveDate: recommendGoLive(p.startDate) }))}
                                  className="ml-2 text-blue-600 hover:underline">Use this</button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                        <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                          {["Confirmed","Tentative","Planning","In Progress","Completed","Cancelled"].map(s=><option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <div className="text-xs font-bold text-teal-800 mb-2">📣 Campaign Brief (Sales → Marketing) · per SOP</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Campaign Objective</label>
                          <select value={form.objective||""} onChange={e=>setForm(p=>({...p,objective:e.target.value}))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                            <option value="">Select objective…</option>
                            {OBJECTIVES.map(o=><option key={o}>{o}</option>)}
                          </select>
                        </div>
                        {BRIEF_FIELDS.map(([label, field, placeholder]) => (
                          <div key={field} className={field==="sellingPoint"||field==="leadDest"?"md:col-span-2":""}>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                            <input type="text" placeholder={placeholder} value={form[field]||""}
                              onChange={e=>setForm(p=>({...p,[field]:e.target.value}))}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Key Notes</label>
                      <textarea value={form.notes||""} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
                        placeholder="Any additional notes…"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={saveEvent} disabled={!form.name||!form.startDate}
                        className="bg-blue-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed">
                        {editEvt ? "Save Changes" : "Add Event"}
                      </button>
                      <button onClick={() => setAddOpen(false)} className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BRIEF & PLANNER ───────────────────────────────────────────── */}
        {tab === "brief" && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-blue-900">Brief & Lead-Time Planner</h2>
              <p className="text-xs text-gray-500">Per the LSW Sales→Marketing SOP. Counts back from the campaign go-live date (or event date if none is set).</p>
            </div>
            {events.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center text-gray-500">Add an event in the Event Master tab to populate the planner.</div>
            )}
            {events.map((ev,ei) => {
              const evKey = `brief-${ev.id}`
              const isExpanded = expandedEvents[evKey] !== false
              const missing = [["Objective",ev.objective],["Audience",ev.audience],["Selling point",ev.sellingPoint],["CTA",ev.cta],["Lead destination",ev.leadDest]]
                .filter(([,v]) => !v).map(([l]) => l)
              const refDate = ev.goLiveDate || ev.startDate
              const refLabel = ev.goLiveDate ? "go-live date" : "event date"
              const maxLead = Math.max(...LEAD_TIMES.map(r => r.leadDays))
              const earliestBrief = refDate ? addDays(refDate, -maxLead) : null
              const eb = earliestBrief ? daysFromToday(earliestBrief) : null
              let ebFeas = null
              if (eb !== null) {
                if (eb < 0)       ebFeas = { label:`❌ ${Math.abs(eb)}d past — too late for longest-lead channels`, cls:"bg-red-100 text-red-800" }
                else if (eb <= 5) ebFeas = { label:`⚠️ Only ${eb}d left — brief now`, cls:"bg-orange-100 text-orange-800" }
                else              ebFeas = { label:`✅ ${eb} days of runway left`, cls:"bg-green-100 text-green-800" }
              }
              return (
                <div key={ev.id} className="mb-6 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <button onClick={() => toggleEvent(evKey)}
                    className="w-full bg-indigo-900 text-white px-5 py-4 flex items-center justify-between hover:bg-indigo-800">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs bg-indigo-700 px-2 py-0.5 rounded">Event {ei+1}</span>
                      <span className="font-bold">{ev.name}</span>
                      <span className="text-indigo-300 text-sm">{ev.startDate ? fmtDate(ev.startDate) : "Date not set"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {ebFeas
                        ? <span className={`text-xs px-2 py-1 rounded-full ${ebFeas.cls}`}>Brief by {fmtDate(earliestBrief)}</span>
                        : <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-500">Set a date</span>}
                      <span className="text-indigo-300">{isExpanded?"▲":"▼"}</span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="p-4 space-y-5">
                      {refDate ? (
                        <div className={`rounded-lg border p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 ${eb!==null&&eb<0?"bg-red-50 border-red-200":eb!==null&&eb<=5?"bg-orange-50 border-orange-200":"bg-green-50 border-green-200"}`}>
                          <div>
                            <div className="text-sm font-semibold text-gray-800">🗓️ Earliest safe brief date: {fmtDate(earliestBrief)}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Brief Marketing by this date to keep every channel on track — counted back 6 weeks from the {refLabel} ({fmtDate(refDate)}).</div>
                          </div>
                          {ebFeas && <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${ebFeas.cls}`}>{ebFeas.label}</span>}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">
                          Set an event date (and optionally a go-live date) in the Event Master tab to calculate brief dates.
                        </div>
                      )}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-bold text-gray-700">1 · Sales Brief</h3>
                          <button onClick={() => openEdit(ev)} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">Edit brief</button>
                        </div>
                        {missing.length > 0 && (
                          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2 mb-2">
                            ⚠️ Brief incomplete — still needed: {missing.join(", ")}
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {[["Objective",ev.objective],["Target audience",ev.audience],["Main selling point",ev.sellingPoint],
                            ["Hero offer / perk",ev.heroOffer],["Call-to-action",ev.cta],["Lead destination",ev.leadDest],
                            ["Booking deadline",ev.bookingDeadline],["Partner vendors",ev.vendors]
                          ].map(([l,v]) => (
                            <div key={l} className="bg-gray-50 border border-gray-100 rounded px-3 py-2">
                              <span className="font-semibold text-gray-500">{l}: </span>
                              <span className={v?"text-gray-800":"text-gray-300"}>{v||"—"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-2">2 · Channel Lead-Time Planner</h3>
                        <p className="text-xs text-gray-400 mb-2">Latest date to brief Marketing per channel, counted back from the {refLabel} ({refDate ? fmtDate(refDate) : "not set"}).</p>
                        <div className="overflow-x-auto border border-gray-100 rounded-lg">
                          <table className="w-full min-w-[760px] text-xs">
                            <thead>
                              <tr className="bg-gray-50 text-gray-500 font-semibold">
                                <th className="px-3 py-2 text-left">Channel</th>
                                <th className="px-3 py-2 text-left">Deliverable</th>
                                <th className="px-3 py-2 text-left">SOP min</th>
                                <th className="px-3 py-2 text-center">Brief by</th>
                                <th className="px-3 py-2 text-center">Feasibility (vs today)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {LEAD_TIMES.map((row,ri) => {
                                const briefBy = refDate ? addDays(refDate, -row.leadDays) : null
                                const d = refDate ? daysFromToday(briefBy) : null
                                let feas = { label:"Set a date", cls:"bg-gray-100 text-gray-400" }
                                if (d !== null) {
                                  if (d < 0)      feas = { label:`❌ Too late · ${Math.abs(d)}d past`, cls:"bg-red-100 text-red-800 font-semibold" }
                                  else if (d <= 5) feas = { label:`⚠️ Tight · ${d}d left`, cls:"bg-orange-100 text-orange-800 font-semibold" }
                                  else             feas = { label:`✅ On track · ${d}d left`, cls:"bg-green-100 text-green-800" }
                                }
                                return (
                                  <tr key={ri} className={`border-t border-gray-100 ${ri%2?"bg-gray-50":"bg-white"}`}>
                                    <td className="px-3 py-2 font-semibold text-gray-700 whitespace-nowrap">{row.channel}</td>
                                    <td className="px-3 py-2 text-gray-700">{row.deliverable}</td>
                                    <td className="px-3 py-2 text-gray-500">{row.sop}</td>
                                    <td className="px-3 py-2 text-center font-semibold text-blue-800 whitespace-nowrap">{refDate ? fmtDate(briefBy) : "—"}</td>
                                    <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded-full whitespace-nowrap ${feas.cls}`}>{feas.label}</span></td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Showcases need 4 weeks minimum; Meta + SEM + EDM together should be briefed 4–6 weeks ahead.</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── TIMELINE ──────────────────────────────────────────────────── */}
        {tab === "timeline" && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-blue-900">Combined Marketing & Sales Timeline</h2>
              <p className="text-xs text-gray-500">{TASKS.length} tasks per event across 8 phases. All dates calculated from the event start date.</p>
            </div>
            {events.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center text-gray-500">No events yet — add one in the Event Master tab.</div>
            )}
            {events.map((ev,ei) => {
              const evKey = `evt-${ev.id}`
              const isExpanded = expandedEvents[evKey] !== false
              const done = TASKS.filter((_,idx) => taskStatus[`${ev.id}-${idx}`]==="Done").length
              return (
                <div key={ev.id} className="mb-6 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <button onClick={() => toggleEvent(evKey)}
                    className="w-full bg-blue-900 text-white px-5 py-4 flex items-center justify-between hover:bg-blue-800">
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-blue-700 px-2 py-0.5 rounded">Event {ei+1}</span>
                      <span className="font-bold text-base">{ev.name}</span>
                      <span className="text-blue-300 text-sm">{ev.startDate === ev.endDate ? fmtDate(ev.startDate) : `${fmtDate(ev.startDate)} – ${fmtDate(ev.endDate)}`}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-green-600 px-2 py-1 rounded-full">{done}/{TASKS.length} done</span>
                      <span className="text-blue-300">{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div>
                      {Object.entries(tasksByPhase).map(([phase, phaseTasks]) => {
                        const phKey = `${ev.id}-${phase}`
                        const phExpanded = expandedPhases[phKey] !== false
                        const phDone = phaseTasks.filter(t => taskStatus[`${ev.id}-${t.idx}`]==="Done").length
                        return (
                          <div key={phase}>
                            <button onClick={() => togglePhase(phKey)}
                              className={`w-full ${PH_COLOUR[phase]||"bg-gray-700"} text-white px-5 py-2.5 flex items-center justify-between hover:opacity-90`}>
                              <span className="font-semibold text-sm">▶ {phase.toUpperCase()}</span>
                              <span className="text-xs opacity-75">{phDone}/{phaseTasks.length} done {phExpanded?"▲":"▼"}</span>
                            </button>
                            {phExpanded && (
                              <div className="overflow-x-auto">
                                <table className="w-full min-w-[1100px]">
                                  <thead>
                                    <tr className="bg-gray-50 text-xs text-gray-500 font-semibold">
                                      <th className="px-3 py-2 text-left w-20">Timing</th>
                                      <th className="px-3 py-2 text-left w-28">Target Date</th>
                                      <th className="px-3 py-2 text-left w-24">Team</th>
                                      <th className="px-3 py-2 text-left flex-1">Task</th>
                                      <th className="px-3 py-2 text-left w-28">Owner</th>
                                      <th className="px-3 py-2 text-left w-20">Priority</th>
                                      <th className="px-3 py-2 text-center w-32">Status</th>
                                      <th className="px-3 py-2 text-left w-48">Notes</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {phaseTasks.map((t,ti) => {
                                      const sk = `${ev.id}-${t.idx}`
                                      const status = taskStatus[sk] || "Not Started"
                                      const targetDate = t.label === "Event" ? new Date(ev.startDate) : addDays(ev.startDate, t.offset)
                                      const team = TEAM[t.team] || TEAM.BOTH
                                      const alt = ti % 2 === 1
                                      return (
                                        <tr key={t.idx} className={`border-t border-gray-100 ${alt ? team.bg : "bg-white"} hover:bg-yellow-50`}>
                                          <td className="px-3 py-2.5 text-xs font-mono text-gray-600 whitespace-nowrap">{t.label}</td>
                                          <td className="px-3 py-2.5 text-xs font-semibold text-blue-800 whitespace-nowrap">
                                            {ev.startDate ? fmtDate(targetDate) : <span className="text-gray-400 italic">Set event date</span>}
                                          </td>
                                          <td className="px-3 py-2.5"><span className={`text-xs px-1.5 py-0.5 rounded-full ${team.badge}`}>{team.label}</span></td>
                                          <td className="px-3 py-2.5 text-xs text-gray-800 font-medium min-w-[280px]">
                                            {t.task}
                                            {t.depends && t.depends !== "—" && <div className="text-gray-400 font-normal mt-0.5">↳ Depends on: {t.depends}</div>}
                                          </td>
                                          <td className="px-3 py-2.5 text-xs font-semibold text-gray-700 whitespace-nowrap">{t.owner}</td>
                                          <td className="px-3 py-2.5"><span className={`text-xs px-1.5 py-0.5 rounded ${PRI[t.priority]||""}`}>{t.priority}</span></td>
                                          <td className="px-3 py-2.5 text-center">
                                            <select value={status} onChange={e => setTS(sk, e.target.value)}
                                              className={`text-xs px-2 py-1 rounded border-0 cursor-pointer ${STATUS_COL[status]||""} focus:outline-none focus:ring-1 focus:ring-blue-400`}>
                                              {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                          </td>
                                          <td className="px-3 py-2.5 text-xs text-gray-400 max-w-[160px]">{t.notes}</td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── COLLATERAL ────────────────────────────────────────────────── */}
        {tab === "collateral" && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-blue-900">Collateral & Creative Tracker</h2>
              <p className="text-xs text-gray-500">Upload reference artwork or link to Drive per item. 📱 = dedicated Meta/SEM ad creatives. All items require Tania approval before print/publish/launch.</p>
            </div>
            {events.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center text-gray-500">Add an event in the Event Master tab to populate collateral deadlines.</div>
            )}
            {events.map((ev,ei) => {
              const evKey = `coll-${ev.id}`
              const isExpanded = expandedEvents[evKey] !== false
              const done = COLLATERAL_ITEMS.filter((_,idx) => ["Done","Approved"].includes(collStatus[`${ev.id}-${idx}`])).length
              const masterFolder = (artwork[ev.id] && artwork[ev.id].masterFolder) || ""
              return (
                <div key={ev.id} className="mb-6 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <button onClick={() => toggleEvent(evKey)}
                    className="w-full bg-teal-800 text-white px-5 py-4 flex items-center justify-between hover:bg-teal-700">
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-teal-600 px-2 py-0.5 rounded">Event {ei+1}</span>
                      <span className="font-bold">{ev.name}</span>
                      <span className="text-teal-300 text-sm">{ev.startDate === ev.endDate ? fmtDate(ev.startDate) : `${fmtDate(ev.startDate)} – ${fmtDate(ev.endDate)}`}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-green-600 px-2 py-1 rounded-full">{done}/{COLLATERAL_ITEMS.length} approved</span>
                      <span className="text-teal-300">{isExpanded?"▲":"▼"}</span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div>
                      <div className="bg-teal-50 border-b border-teal-100 px-4 py-2 flex items-center gap-2 text-xs flex-wrap">
                        <span className="font-semibold whitespace-nowrap text-teal-800">📁 Master artwork folder (Drive):</span>
                        <input value={masterFolder} onChange={e => updateArt(ev.id, "masterFolder", e.target.value)}
                          placeholder="Paste a shared Google Drive folder link for all of this event's artwork"
                          className="flex-1 min-w-0 border border-teal-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-400" />
                        {masterFolder && <a href={masterFolder} target="_blank" rel="noreferrer" className="bg-teal-700 text-white px-3 py-1 rounded whitespace-nowrap hover:opacity-90">Open ↗</a>}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px]">
                          <thead>
                            <tr className="bg-gray-50 text-xs text-gray-500 font-semibold">
                              <th className="px-3 py-2 text-left">#</th>
                              <th className="px-3 py-2 text-left">Item</th>
                              <th className="px-3 py-2 text-center">Type</th>
                              <th className="px-3 py-2 text-center">📱 Ad</th>
                              <th className="px-3 py-2 text-center">Design By</th>
                              <th className="px-3 py-2 text-center">Print / Publish By</th>
                              <th className="px-3 py-2 text-center">Owner</th>
                              <th className="px-3 py-2 text-center">Approved</th>
                              <th className="px-3 py-2 text-center w-32">Status</th>
                              <th className="px-3 py-2 text-center">Artwork / Ref</th>
                              <th className="px-3 py-2 text-left">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {COLLATERAL_ITEMS.map((item,idx) => {
                              const sk = `${ev.id}-${idx}`
                              const status = collStatus[sk] || "Not Started"
                              const designDate = addDays(ev.startDate, item.designOff)
                              const pubDate = item.pubOff !== null ? addDays(ev.startDate, item.pubOff) : null
                              const flagged = !!metaFlag[sk]
                              const alt = idx % 2 === 1
                              return (
                                <tr key={idx} className={`border-t border-gray-100 ${item.meta ? "bg-purple-50" : (alt ? "bg-blue-50" : "bg-white")} hover:bg-yellow-50`}>
                                  <td className="px-3 py-2.5 text-xs text-gray-400">{idx+1}</td>
                                  <td className="px-3 py-2.5 text-xs font-semibold text-gray-800">{item.name}{item.reuse && <span className="ml-1 text-teal-600">★</span>}</td>
                                  <td className="px-3 py-2.5 text-center"><span className={`text-xs px-2 py-0.5 rounded ${item.meta?"bg-purple-100 text-purple-800 font-semibold":"bg-gray-100 text-gray-600"}`}>{item.type}</span></td>
                                  <td className="px-3 py-2.5 text-center">
                                    {item.meta ? (
                                      <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">📱 Ad creative</span>
                                    ) : (
                                      <button onClick={() => toggleMeta(sk)}
                                        className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${flagged?"bg-purple-100 text-purple-800 font-semibold":"bg-gray-100 text-gray-400 hover:bg-purple-50 hover:text-purple-600"}`}>
                                        {flagged ? "📱 Also on Meta" : "+ Use for Meta"}
                                      </button>
                                    )}
                                  </td>
                                  <td className="px-3 py-2.5 text-center text-xs font-semibold text-amber-700">{ev.startDate ? fmtDate(designDate) : "—"}</td>
                                  <td className="px-3 py-2.5 text-center text-xs font-bold text-red-700">{ev.startDate && pubDate ? fmtDate(pubDate) : "—"}</td>
                                  <td className="px-3 py-2.5 text-center text-xs font-semibold">{item.owner}</td>
                                  <td className="px-3 py-2.5 text-center"><span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">TANIA</span></td>
                                  <td className="px-3 py-2.5 text-center">
                                    <select value={status} onChange={e => setCS(sk, e.target.value)}
                                      className={`text-xs px-2 py-1 rounded border-0 cursor-pointer ${STATUS_COL[status]||""} focus:outline-none focus:ring-1 focus:ring-blue-400`}>
                                      {[...STATUS_OPTS,"Approved"].map(s => <option key={s}>{s}</option>)}
                                    </select>
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <ArtworkCell art={getArt(ev.id, idx)}
                                      onUpload={(img,name) => updateArt(ev.id, idx, {img, name})}
                                      onLink={link => updateArt(ev.id, idx, {link})}
                                      onClear={() => updateArt(ev.id, idx, {img:null, name:null})}
                                      onView={a => setLightbox(a)} />
                                  </td>
                                  <td className="px-3 py-2.5 text-xs text-gray-400 max-w-[140px]">{item.note}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                        <div className="px-4 py-2 text-xs text-gray-400 bg-gray-50">★ = reusable across events · 📱 = ad creative (Meta/SEM) · Prefer Drive links over uploads for best performance.</div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-6" style={{zIndex:60}} onClick={() => setLightbox(null)}>
          <div className="max-w-3xl flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img src={lightbox.img} alt="artwork reference" className="max-w-full rounded-lg shadow-2xl" style={{maxHeight:"80vh"}} />
            <div className="flex justify-between items-center w-full mt-3 text-white text-xs gap-3">
              <span className="truncate">{lightbox.name || "Reference artwork"}</span>
              <div className="flex gap-2 flex-shrink-0">
                {lightbox.link && <a href={lightbox.link} target="_blank" rel="noreferrer" className="bg-teal-600 hover:bg-teal-500 px-3 py-1.5 rounded">Open in Drive ↗</a>}
                <button onClick={() => setLightbox(null)} className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
