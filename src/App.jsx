import { useState, useEffect } from "react"
import { createClient } from '@supabase/supabase-js'
import { OBJECTIVES, LEAD_TIMES, CATEGORIES, getTasks, getCollateral } from './data'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const TEAM = {
  MKT:   { bg:"bg-blue-50",   badge:"bg-blue-800 text-white",  label:"🔵 Marketing" },
  SALES: { bg:"bg-teal-50",   badge:"bg-teal-700 text-white",  label:"🟢 Sales" },
  TANIA: { bg:"bg-amber-50",  badge:"bg-amber-600 text-white", label:"🟡 Tania" },
  BOTH:  { bg:"bg-purple-50", badge:"bg-purple-700 text-white",label:"🟣 Both" },
}
const PH_COLOUR = {
  "Plan & Brief":"bg-blue-900", Collateral:"bg-teal-700", Launch:"bg-blue-700",
  "Build-up":"bg-green-700",    "Final Push":"bg-orange-600", "Event Day":"bg-red-700",
  "Follow-up":"bg-purple-700",  Review:"bg-green-600",
}
const PRI = { P1:"bg-red-100 text-red-800 font-bold", P2:"bg-orange-100 text-orange-800", P3:"bg-green-100 text-green-800" }
const STATUS_OPTS = ["Not Started","In Progress","Done","Blocked","Urgent","N/A"]
const STATUS_OPTS_COLL = [...STATUS_OPTS,"Approved"]
const STATUS_COL = {
  "Not Started":"bg-gray-100 text-gray-600", "In Progress":"bg-blue-100 text-blue-800",
  "Done":"bg-green-100 text-green-800",      "Blocked":"bg-red-100 text-red-800",
  "Urgent":"bg-orange-100 text-orange-800",  "N/A":"bg-gray-50 text-gray-400",
  "Approved":"bg-green-100 text-green-800",
}
const DONE_STATES = ["Done","Approved","N/A"]
const catLabel = k => (CATEGORIES.find(c => c.key === k)?.label) || "Showcase (default)"

function addDays(iso, n) { if (!iso) return null; const d = new Date(iso); d.setDate(d.getDate()+n); return d }
function fmtDate(d) { if (!d) return "—"; if (typeof d==="string") d=new Date(d); return d.toLocaleDateString("en-SG",{day:"numeric",month:"short",year:"numeric"}) }
function daysFromToday(t) { if (!t) return null; const a=new Date(); a.setHours(0,0,0,0); const b=new Date(t); b.setHours(0,0,0,0); return Math.round((b-a)/86400000) }
function isoDate(d) { if (!d) return ""; if (typeof d==="string") d=new Date(d); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` }
function recommendGoLive(s) { return s ? isoDate(addDays(s,-28)) : "" }

// Returns overdue / due-today / due-soon info for a date, unless the task is already done/n-a.
function dueInfo(date, status) {
  if (!date) return null
  if (DONE_STATES.includes(status)) return null
  const d = daysFromToday(date)
  if (d === null) return null
  if (d < 0)  return { kind:"overdue", days:-d, label:`${-d}d late`,  cls:"bg-red-100 text-red-800",    dot:"bg-red-500",   accent:"border-l-red-500" }
  if (d === 0) return { kind:"today",  days:0,  label:"due today",     cls:"bg-orange-100 text-orange-800", dot:"bg-orange-500", accent:"border-l-orange-500" }
  if (d <= 3) return { kind:"soon",    days:d,  label:`in ${d}d`,      cls:"bg-amber-100 text-amber-800",   dot:"bg-amber-400",  accent:"border-l-amber-400" }
  return null
}
function DueChip({ info }) {
  if (!info) return null
  return <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap font-semibold ${info.cls}`}>{info.label}</span>
}

function compressImage(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let w=img.width, h=img.height
        if (w>=h&&w>maxDim){h=Math.round(h*maxDim/w);w=maxDim} else if(h>w&&h>maxDim){w=Math.round(w*maxDim/h);h=maxDim}
        const canvas=document.createElement("canvas"); canvas.width=w; canvas.height=h
        const ctx=canvas.getContext("2d"); ctx.fillStyle="#fff"; ctx.fillRect(0,0,w,h); ctx.drawImage(img,0,0,w,h)
        try{resolve(canvas.toDataURL("image/jpeg",quality))}catch(e){reject(e)}
      }
      img.onerror=reject; img.src=reader.result
    }
    reader.onerror=reject; reader.readAsDataURL(file)
  })
}

async function loadStorage(key, fallback) {
  try { const {data,error}=await supabase.from('lsw_tracker').select('value').eq('key',key).single(); if(error||!data) return fallback; return JSON.parse(data.value) } catch { return fallback }
}
async function saveStorage(key, val) {
  try { await supabase.from('lsw_tracker').upsert({key,value:JSON.stringify(val),updated_at:new Date().toISOString()},{onConflict:'key'}) } catch {}
}
async function persistArtwork(eventId, obj) {
  try { await supabase.from('lsw_tracker').upsert({key:`lsw-art:${eventId}`,value:JSON.stringify(obj),updated_at:new Date().toISOString()},{onConflict:'key'}) } catch {}
}
async function deleteArtwork(eventId) { try { await supabase.from('lsw_tracker').delete().eq('key',`lsw-art:${eventId}`) } catch {} }
async function loadAllArtwork() {
  const map={}
  try { const {data}=await supabase.from('lsw_tracker').select('key,value').like('key','lsw-art:%'); if(data) data.forEach(r=>{try{map[r.key.replace('lsw-art:','')]=JSON.parse(r.value)}catch{}}) } catch {}
  return map
}

function ArtworkCell({ art={}, onUpload, onLink, onClear, onView }) {
  const [showLink,setShowLink]=useState(false)
  const [linkVal,setLinkVal]=useState(art.link||"")
  const [busy,setBusy]=useState(false)
  useEffect(()=>{setLinkVal(art.link||"")},[art.link])
  const handleFile=async(e)=>{
    const f=e.target.files&&e.target.files[0]; if(!f) return
    if(!f.type||!f.type.startsWith("image/")){alert("Please choose an image file."); e.target.value=""; return}
    setBusy(true)
    try { const d=await compressImage(f,480,0.5); if(d.length>3000000){alert("Image too large — use a Drive link instead.")}else{onUpload(d,f.name)} }
    catch{alert("Couldn't process image. Try a Drive link.")}
    setBusy(false); e.target.value=""
  }
  return (
    <div className="flex flex-col gap-1 items-center w-24">
      {art.img ? (
        <div className="relative">
          <img src={art.img} alt="ref" onClick={()=>onView(art)} className="w-14 h-14 object-cover rounded border border-gray-300 cursor-pointer"/>
          <button onClick={onClear} className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-700">✕</button>
        </div>
      ):(
        <label className="w-14 h-14 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 text-gray-400">
          <span className="text-lg leading-none">{busy?"…":"＋"}</span><span className="text-xs">{busy?"loading":"Upload"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile}/>
        </label>
      )}
      {art.img&&<label className="text-xs text-blue-600 cursor-pointer hover:underline">replace<input type="file" accept="image/*" className="hidden" onChange={handleFile}/></label>}
      {art.link?(
        <div className="flex items-center gap-1">
          <a href={art.link} target="_blank" rel="noreferrer" className="text-xs text-teal-700 hover:underline">📂 Drive</a>
          <button onClick={()=>setShowLink(s=>!s)} className="text-xs text-gray-400 hover:text-gray-700">edit</button>
        </div>
      ):<button onClick={()=>setShowLink(s=>!s)} className="text-xs text-gray-400 hover:text-teal-700">🔗 Drive link</button>}
      {showLink&&(
        <div className="flex flex-col gap-1">
          <input value={linkVal} onChange={e=>setLinkVal(e.target.value)} placeholder="Paste Drive link" className="border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-400"/>
          <div className="flex gap-1 justify-center">
            <button onClick={()=>{onLink((linkVal||"").trim());setShowLink(false)}} className="bg-teal-700 text-white rounded px-2 py-0.5 text-xs">Save</button>
            <button onClick={()=>{setLinkVal(art.link||"");setShowLink(false)}} className="text-xs text-gray-400">cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)} className={`text-xs px-2 py-1 rounded border-0 cursor-pointer ${STATUS_COL[value]||""} focus:outline-none focus:ring-1 focus:ring-blue-300`}>
      {options.map(s=><option key={s}>{s}</option>)}
    </select>
  )
}

export default function App() {
  const [tab,setTab]=useState("events")
  const [events,setEvents]=useState([])
  const [taskStatus,setTaskStatus]=useState({})
  const [collStatus,setCollStatus]=useState({})
  const [metaFlag,setMetaFlag]=useState({})
  const [artwork,setArtwork]=useState({})
  const [lightbox,setLightbox]=useState(null)
  const [loaded,setLoaded]=useState(false)
  const [saving,setSaving]=useState(false)
  const [addOpen,setAddOpen]=useState(false)
  const [editEvt,setEditEvt]=useState(null)
  const [form,setForm]=useState(blank())
  const [expandedPhases,setExpandedPhases]=useState({})
  const [expandedEvents,setExpandedEvents]=useState({})
  const [showSkipped,setShowSkipped]=useState({})

  // ─── Filters ───────────────────────────────────────────────────────────────
  const [fTeams,setFTeams]=useState([])      // [] = all teams
  const [fStatus,setFStatus]=useState("")    // "" = any status
  const [fOwner,setFOwner]=useState("")      // free-text owner search
  const [fOverdue,setFOverdue]=useState(false)
  const [fMine,setFMine]=useState(false)     // Tania's tasks
  const isFiltering = fTeams.length>0 || fStatus || fOwner.trim() || fOverdue || fMine
  const clearFilters=()=>{setFTeams([]);setFStatus("");setFOwner("");setFOverdue(false);setFMine(false)}
  const toggleTeam=k=>setFTeams(p=>p.includes(k)?p.filter(x=>x!==k):[...p,k])

  // A single matcher used by Timeline (team set) and Collateral (team=null).
  function passFilters({ team=null, owner="", status="Not Started", date=null }) {
    if (team!==null && fTeams.length && !fTeams.includes(team)) return false
    if (fMine) { const mine = team==="TANIA" || /\bTD\b|Tania/i.test(owner); if (!mine) return false }
    if (fStatus && status!==fStatus) return false
    if (fOwner.trim() && !owner.toLowerCase().includes(fOwner.trim().toLowerCase())) return false
    if (fOverdue) { const di=dueInfo(date,status); if (!di || di.kind!=="overdue") return false }
    return true
  }

  function blank(){return{name:"",category:"",startDate:"",endDate:"",goLiveDate:"",venue:"",status:"Confirmed",salesLead:"Neshah (NSH)",marketingLead:"Tania (TD)",heroOffer:"",vendors:"",notes:"",objective:"",audience:"",sellingPoint:"",cta:"",leadDest:"",bookingDeadline:""}}

  useEffect(()=>{
    (async()=>{
      const[ev,ts,cs,mf,art]=await Promise.all([loadStorage("lsw-events",[]),loadStorage("lsw-task-status",{}),loadStorage("lsw-coll-status",{}),loadStorage("lsw-meta-flag",{}),loadAllArtwork()])
      setEvents(ev);setTaskStatus(ts);setCollStatus(cs);setMetaFlag(mf);setArtwork(art);setLoaded(true)
    })()
  },[])

  useEffect(()=>{
    if(!loaded) return
    setSaving(true)
    const t=setTimeout(async()=>{
      await Promise.all([saveStorage("lsw-events",events),saveStorage("lsw-task-status",taskStatus),saveStorage("lsw-coll-status",collStatus),saveStorage("lsw-meta-flag",metaFlag)])
      setSaving(false)
    },800)
    return()=>clearTimeout(t)
  },[events,taskStatus,collStatus,metaFlag,loaded])

  const togPh=k=>setExpandedPhases(p=>({...p,[k]:!p[k]}))
  const togEv=k=>setExpandedEvents(p=>({...p,[k]:!p[k]}))
  const openAdd=()=>{setForm(blank());setEditEvt(null);setAddOpen(true)}
  const openEdit=ev=>{setForm({...blank(),...ev});setEditEvt(ev.id);setAddOpen(true)}
  const saveEvent=()=>{
    if(!form.name||!form.startDate||!form.category) return
    const e={...form,id:editEvt||Date.now().toString(),endDate:form.endDate||form.startDate}
    setEvents(p=>editEvt?p.map(x=>x.id===editEvt?e:x):[...p,e]);setAddOpen(false)
  }
  const deleteEvent=id=>{
    if(!confirm("Delete this event and all its data?")) return
    setEvents(p=>p.filter(e=>e.id!==id))
    const strip=setter=>setter(p=>{const n={...p};Object.keys(n).filter(k=>k.startsWith(id)).forEach(k=>delete n[k]);return n})
    strip(setTaskStatus);strip(setCollStatus);strip(setMetaFlag)
    setArtwork(p=>{const n={...p};delete n[id];return n});deleteArtwork(id)
  }
  const setTS=(k,v)=>setTaskStatus(p=>({...p,[k]:v}))
  const setCS=(k,v)=>setCollStatus(p=>({...p,[k]:v}))
  const togMeta=k=>setMetaFlag(p=>({...p,[k]:!p[k]}))
  const getArt=(eId,idx)=>(artwork[eId]&&artwork[eId].coll&&artwork[eId].coll[idx])||{}
  const updateArt=(eId,idx,patch)=>{
    setArtwork(prev=>{
      const cur=prev[eId]||{coll:{},masterFolder:""}
      const evArt=idx==="masterFolder"?{...cur,masterFolder:patch}:(()=>{const s={...(cur.coll||{})};s[idx]={...(s[idx]||{}),...patch};return{...cur,coll:s}})()
      queueMicrotask(()=>persistArtwork(eId,evArt))
      return{...prev,[eId]:evArt}
    })
  }

  if(!loaded) return <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">Loading tracker…</div>

  const totalTasks = events.reduce((s,ev)=>s+getTasks(ev.category).length,0)
  // Overall progress + overdue across all events (timeline tasks).
  const allDone = events.reduce((s,ev)=>{const ts=getTasks(ev.category);return s+ts.filter((_,idx)=>taskStatus[`${ev.id}-${idx}`]==="Done").length},0)
  const overallPct = totalTasks?Math.round(allDone/totalTasks*100):0
  const overdueTotal = events.reduce((s,ev)=>{
    const ts=getTasks(ev.category)
    return s+ts.filter((t,idx)=>{
      const st=taskStatus[`${ev.id}-${idx}`]||"Not Started"
      const di=dueInfo(ev.startDate?addDays(ev.startDate,t.offset):null, st)
      return di&&di.kind==="overdue"
    }).length
  },0)

  const TABS=[{id:"events",label:"📋 Event Master"},{id:"brief",label:"📣 Brief & Planner"},{id:"timeline",label:"📅 Timeline"},{id:"collateral",label:"🎨 Collateral & Creative"}]
  const FORM_FIELDS=[["Event Name *","name","text","e.g. The Wedding Upmarket @ Suntec"],["Start / Event Date *","startDate","date",""],["End Date","endDate","date","Same as start for single-day"],["Campaign Go-Live Date","goLiveDate","date","Auto-recommended as 4 weeks before event"],["Venue / Hall","venue","text","e.g. Royal Hall, Bukit Timah"],["Sales Lead","salesLead","text","e.g. Neshah (NSH)"],["Marketing Lead","marketingLead","text","e.g. Tania (TD)"],["Hero Offer / Showcase Perk","heroOffer","text","e.g. Free décor upgrade + bonus yuu Points"],["Partner Vendors","vendors","text","e.g. florist, media team, bridal partners"]]
  const BRIEF_FIELDS=[["Target Audience","audience","e.g. Newly engaged Muslim couples planning 2027"],["Main Selling Point","sellingPoint","e.g. All-inclusive halal package, venue + catering + décor"],["Call-to-Action","cta","e.g. RSVP for the showcase / WhatsApp to enquire"],["Lead Destination","leadDest","e.g. Meta lead form → GHL / WhatsApp / RSVP landing page"],["Booking Deadline / Validity","bookingDeadline","e.g. Event-only perk; deposit by 31 Aug 2026"]]

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-sm">
      <div className="bg-blue-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap shadow-lg">
        <div><div className="text-xs text-blue-300 font-medium tracking-wide">LAGUN SARI WEDDINGS & EVENTS</div><div className="text-lg font-bold">✿ Showcase & Events Tracker</div></div>
        <div className="flex items-center gap-2 flex-wrap">
          {overdueTotal>0&&(
            <button onClick={()=>{setTab("timeline");setFOverdue(true)}} className="text-xs px-2 py-1 rounded-full bg-red-500 hover:bg-red-400 font-semibold" title="Show only overdue tasks">⏰ {overdueTotal} overdue</button>
          )}
          <div className="flex items-center gap-2 bg-blue-800 px-2 py-1 rounded">
            <span className="text-xs whitespace-nowrap">{allDone}/{totalTasks} done</span>
            <div className="w-16 h-1.5 bg-blue-950 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{width:`${overallPct}%`}}/></div>
            <span className="text-xs font-semibold">{overallPct}%</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${saving?"bg-amber-500":"bg-green-600"}`}>{saving?"Saving…":"✓ Saved"}</span>
          <span className="text-xs bg-blue-700 px-2 py-1 rounded">{events.length} event{events.length!==1?"s":""}</span>
        </div>
      </div>
      <div className="bg-blue-800 text-white px-4 sm:px-6 py-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-blue-300 mr-1 hidden sm:inline">Team filter:</span>
        {Object.entries(TEAM).map(([k,v])=>{
          const active=fTeams.includes(k)
          return <button key={k} onClick={()=>toggleTeam(k)} title="Click to filter timeline by team" className={`px-2 py-0.5 rounded-full transition ${v.badge} ${active?"ring-2 ring-white ring-offset-1 ring-offset-blue-800":fTeams.length?"opacity-40 hover:opacity-70":"hover:opacity-90"}`}>{v.label}</button>
        })}
        <span className="text-blue-300 ml-2">Priority: 🔴P1 = Critical  🟠P2 = Important</span>
      </div>
      <div className="bg-white border-b border-gray-200 px-2 sm:px-4 flex gap-1 sticky top-0 z-20 shadow-sm overflow-x-auto">
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab===t.id?"border-blue-800 text-blue-900":"border-transparent text-gray-500 hover:text-gray-800"}`}>{t.label}</button>)}
      </div>

      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 py-4">

        {/* FILTER BAR (Timeline + Collateral) */}
        {(tab==="timeline"||tab==="collateral")&&(
          <div className="flex flex-wrap items-center gap-2 mb-4 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs shadow-sm">
            <span className="font-semibold text-gray-500">🔎 Filter</span>
            <input value={fOwner} onChange={e=>setFOwner(e.target.value)} placeholder="Owner (NSH, CI, TD…)" className="border border-gray-300 rounded px-2 py-1 text-xs w-40 focus:outline-none focus:ring-1 focus:ring-blue-400"/>
            <select value={fStatus} onChange={e=>setFStatus(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400">
              <option value="">All statuses</option>
              {STATUS_OPTS_COLL.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={()=>setFOverdue(v=>!v)} className={`px-2 py-1 rounded-full font-semibold ${fOverdue?"bg-red-600 text-white":"bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600"}`}>⏰ Overdue only</button>
            <button onClick={()=>setFMine(v=>!v)} className={`px-2 py-1 rounded-full font-semibold ${fMine?"bg-amber-500 text-white":"bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-700"}`}>🟡 My tasks</button>
            {tab==="timeline"&&<span className="text-gray-300 hidden sm:inline">· team chips above filter too</span>}
            {isFiltering&&<button onClick={clearFilters} className="ml-auto px-2 py-1 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">Clear ✕</button>}
          </div>
        )}

        {/* EVENT MASTER */}
        {tab==="events"&&(
          <div>
            <div className="flex items-center justify-between mb-4">
              <div><h2 className="text-lg font-bold text-blue-900">Event Master List</h2><p className="text-xs text-gray-500 mt-0.5">Each event's category sets its own timeline & collateral checklist</p></div>
              <button onClick={openAdd} className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800">+ Add New Event</button>
            </div>
            {events.length===0&&<div className="bg-amber-50 border border-amber-300 rounded-lg p-8 text-center"><div className="text-3xl mb-2">✿</div><div className="font-semibold text-amber-800">No events yet</div><div className="text-sm text-amber-600 mt-1">Click 'Add New Event' to get started.</div></div>}
            <div className="space-y-3">
              {events.map((ev,i)=>{
                const hasBrief=ev.objective||ev.audience||ev.sellingPoint||ev.cta||ev.leadDest
                const tasks=getTasks(ev.category)
                const done=tasks.filter((_,idx)=>taskStatus[`${ev.id}-${idx}`]==="Done").length
                const pct=tasks.length?Math.round((done/tasks.length)*100):0
                const evOverdue=tasks.filter((t,idx)=>{const st=taskStatus[`${ev.id}-${idx}`]||"Not Started";const di=dueInfo(ev.startDate?addDays(ev.startDate,t.offset):null,st);return di&&di.kind==="overdue"}).length
                const evSoon=tasks.filter((t,idx)=>{const st=taskStatus[`${ev.id}-${idx}`]||"Not Started";const di=dueInfo(ev.startDate?addDays(ev.startDate,t.offset):null,st);return di&&(di.kind==="today"||di.kind==="soon")}).length
                return(
                  <div key={ev.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-blue-900 text-white px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs bg-blue-700 rounded px-2 py-0.5">Event {i+1}</span>
                        <span className="font-bold text-base">{ev.name}</span>
                        <span className="text-xs bg-indigo-600 px-2 py-0.5 rounded">{catLabel(ev.category)}</span>
                        <span className="text-blue-300 text-xs">{ev.startDate===ev.endDate?fmtDate(ev.startDate):`${fmtDate(ev.startDate)} – ${fmtDate(ev.endDate)}`}</span>
                        {ev.goLiveDate&&<span className="text-xs bg-blue-700 px-2 py-0.5 rounded">Go-live: {fmtDate(ev.goLiveDate)}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {evOverdue>0&&<button onClick={()=>{setTab("timeline");setFOverdue(true)}} className="text-xs px-2 py-0.5 rounded-full bg-red-500 hover:bg-red-400 font-semibold" title="View overdue on Timeline">⏰ {evOverdue} overdue</button>}
                        {evOverdue===0&&evSoon>0&&<span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 font-semibold" title="Tasks due within 3 days">⏳ {evSoon} due soon</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ev.status==="Confirmed"?"bg-green-100 text-green-800":ev.status==="Completed"?"bg-gray-200 text-gray-600":ev.status==="Cancelled"?"bg-red-100 text-red-700":"bg-amber-100 text-amber-800"}`}>{ev.status}</span>
                        <button onClick={()=>openEdit(ev)} className="text-xs bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded">Edit</button>
                        <button onClick={()=>deleteEvent(ev.id)} className="text-xs bg-red-700 hover:bg-red-600 px-3 py-1 rounded">Delete</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                      {[["Category",catLabel(ev.category)],["Venue",ev.venue||"—"],["Sales Lead",ev.salesLead||"—"],["Marketing Lead",ev.marketingLead||"—"],["Hero Offer",ev.heroOffer||"—"],["Partner Vendors",ev.vendors||"—"],["Objective",ev.objective||"—"],["Booking deadline",ev.bookingDeadline||"—"]].map(([l,v])=>(
                        <div key={l}><div className="text-xs text-gray-400 font-medium">{l}</div><div className="text-sm text-gray-800 mt-0.5">{v}</div></div>
                      ))}
                      {ev.notes&&<div className="col-span-2 md:col-span-4"><div className="text-xs text-gray-400 font-medium">Notes</div><div className="text-sm text-gray-800 mt-0.5">{ev.notes}</div></div>}
                    </div>
                    {hasBrief&&<div className="px-4 pb-3"><div className="bg-teal-50 border border-teal-100 rounded-lg p-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div><span className="font-semibold text-teal-800">Audience:</span> {ev.audience||"—"}</div>
                      <div><span className="font-semibold text-teal-800">Selling point:</span> {ev.sellingPoint||"—"}</div>
                      <div><span className="font-semibold text-teal-800">CTA:</span> {ev.cta||"—"}</div>
                      <div><span className="font-semibold text-teal-800">Lead destination:</span> {ev.leadDest||"—"}</div>
                    </div></div>}
                    <div className="px-4 pb-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1"><span>Timeline progress</span><span>{done}/{tasks.length} tasks done</span></div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full transition-all" style={{width:`${pct}%`}}/></div>
                    </div>
                  </div>
                )
              })}
            </div>
            {addOpen&&(
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-4">
                  <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between rounded-t-xl sticky top-0 z-10">
                    <span className="font-bold text-base">{editEvt?"Edit Event":"Add New Event"}</span>
                    <button onClick={()=>setAddOpen(false)} className="text-blue-300 hover:text-white text-xl">✕</button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                      <label className="block text-xs font-bold text-indigo-900 mb-1">Event Category * — sets the timeline & collateral checklist</label>
                      <select value={form.category||""} onChange={e=>setForm(p=>({...p,category:e.target.value}))}
                        className="w-full border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">Select a category…</option>
                        {CATEGORIES.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                      {form.category
                        ? <div className="text-xs text-indigo-700 mt-1">{CATEGORIES.find(c=>c.key===form.category)?.desc}</div>
                        : <div className="text-xs text-amber-700 mt-1">⚠️ Choose a category to load the right checklist before saving.</div>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {FORM_FIELDS.map(([label,field,type,placeholder])=>(
                        <div key={field} className={field==="vendors"||field==="heroOffer"?"md:col-span-2":""}>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                          <input type={type} placeholder={placeholder} value={form[field]||""}
                            onChange={e=>{const val=e.target.value;setForm(p=>{const n={...p,[field]:val};if(field==="startDate"&&val&&!p.goLiveDate)n.goLiveDate=recommendGoLive(val);return n})}}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                          {field==="goLiveDate"&&form.startDate&&(
                            <div className="text-xs text-gray-400 mt-1">Recommended: <span className="font-semibold text-gray-600">{fmtDate(recommendGoLive(form.startDate))}</span> — 4 weeks before event.
                              {form.goLiveDate!==recommendGoLive(form.startDate)&&<button type="button" onClick={()=>setForm(p=>({...p,goLiveDate:recommendGoLive(p.startDate)}))} className="ml-2 text-blue-600 hover:underline">Use this</button>}
                            </div>
                          )}
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                        <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                          {["Confirmed","Tentative","Planning","In Progress","Completed","Cancelled"].map(s=><option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <div className="text-xs font-bold text-teal-800 mb-2">📣 Campaign Brief (Sales → Marketing)</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Campaign Objective</label>
                          <select value={form.objective||""} onChange={e=>setForm(p=>({...p,objective:e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                            <option value="">Select objective…</option>
                            {OBJECTIVES.map(o=><option key={o}>{o}</option>)}
                          </select>
                        </div>
                        {BRIEF_FIELDS.map(([label,field,placeholder])=>(
                          <div key={field} className={field==="sellingPoint"||field==="leadDest"?"md:col-span-2":""}>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                            <input type="text" placeholder={placeholder} value={form[field]||""} onChange={e=>setForm(p=>({...p,[field]:e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Key Notes</label>
                      <textarea value={form.notes||""} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Any additional notes…" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <div className="flex gap-3 pt-2 items-center">
                      <button onClick={saveEvent} disabled={!form.name||!form.startDate||!form.category} className="bg-blue-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed">{editEvt?"Save Changes":"Add Event"}</button>
                      <button onClick={()=>setAddOpen(false)} className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
                      {(!form.name||!form.startDate||!form.category)&&<span className="text-xs text-amber-600">Name, date & category are required</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BRIEF & PLANNER */}
        {tab==="brief"&&(
          <div>
            <div className="mb-4"><h2 className="text-lg font-bold text-blue-900">Brief & Lead-Time Planner</h2><p className="text-xs text-gray-500">Counts back from the campaign go-live date (or event date if none is set).</p></div>
            {events.length===0&&<div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center text-gray-500">Add an event in the Event Master tab.</div>}
            {events.map((ev,ei)=>{
              const evKey=`brief-${ev.id}`, isExp=expandedEvents[evKey]!==false
              const missing=[["Objective",ev.objective],["Audience",ev.audience],["Selling point",ev.sellingPoint],["CTA",ev.cta],["Lead destination",ev.leadDest]].filter(([,v])=>!v).map(([l])=>l)
              const refDate=ev.goLiveDate||ev.startDate, refLabel=ev.goLiveDate?"go-live date":"event date"
              const maxLead=Math.max(...LEAD_TIMES.map(r=>r.leadDays))
              const earliestBrief=refDate?addDays(refDate,-maxLead):null
              const eb=earliestBrief?daysFromToday(earliestBrief):null
              const ebFeas=eb===null?null:eb<0?{label:`❌ ${Math.abs(eb)}d past`,cls:"bg-red-100 text-red-800"}:eb<=5?{label:`⚠️ ${eb}d left — brief now`,cls:"bg-orange-100 text-orange-800"}:{label:`✅ ${eb} days runway`,cls:"bg-green-100 text-green-800"}
              return(
                <div key={ev.id} className="mb-6 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <button onClick={()=>togEv(evKey)} className="w-full bg-indigo-900 text-white px-5 py-4 flex items-center justify-between hover:bg-indigo-800">
                    <div className="flex items-center gap-3 flex-wrap"><span className="text-xs bg-indigo-700 px-2 py-0.5 rounded">Event {ei+1}</span><span className="font-bold">{ev.name}</span><span className="text-xs bg-indigo-600 px-2 py-0.5 rounded">{catLabel(ev.category)}</span><span className="text-indigo-300 text-sm">{ev.startDate?fmtDate(ev.startDate):"Date not set"}</span></div>
                    <div className="flex items-center gap-3">
                      {ebFeas?<span className={`text-xs px-2 py-1 rounded-full ${ebFeas.cls}`}>Brief by {fmtDate(earliestBrief)}</span>:<span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-500">Set a date</span>}
                      <span className="text-indigo-300">{isExp?"▲":"▼"}</span>
                    </div>
                  </button>
                  {isExp&&(
                    <div className="p-4 space-y-5">
                      {refDate?(
                        <div className={`rounded-lg border p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 ${eb!==null&&eb<0?"bg-red-50 border-red-200":eb!==null&&eb<=5?"bg-orange-50 border-orange-200":"bg-green-50 border-green-200"}`}>
                          <div><div className="text-sm font-semibold text-gray-800">🗓️ Earliest safe brief date: {fmtDate(earliestBrief)}</div><div className="text-xs text-gray-500 mt-0.5">Brief Marketing by this date to keep every channel on track — counted back 6 weeks from the {refLabel} ({fmtDate(refDate)}).</div></div>
                          {ebFeas&&<span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${ebFeas.cls}`}>{ebFeas.label}</span>}
                        </div>
                      ):<div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">Set an event date in the Event Master tab to calculate brief dates.</div>}
                      <div>
                        <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold text-gray-700">1 · Sales Brief</h3><button onClick={()=>openEdit(ev)} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">Edit brief</button></div>
                        {missing.length>0&&<div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2 mb-2">⚠️ Brief incomplete — still needed: {missing.join(", ")}</div>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {[["Objective",ev.objective],["Target audience",ev.audience],["Main selling point",ev.sellingPoint],["Hero offer",ev.heroOffer],["Call-to-action",ev.cta],["Lead destination",ev.leadDest],["Booking deadline",ev.bookingDeadline],["Partner vendors",ev.vendors]].map(([l,v])=>(
                            <div key={l} className="bg-gray-50 border border-gray-100 rounded px-3 py-2"><span className="font-semibold text-gray-500">{l}: </span><span className={v?"text-gray-800":"text-gray-300"}>{v||"—"}</span></div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-2">2 · Channel Lead-Time Planner</h3>
                        <p className="text-xs text-gray-400 mb-2">Counted back from the {refLabel} ({refDate?fmtDate(refDate):"not set"}).</p>
                        <div className="overflow-x-auto border border-gray-100 rounded-lg">
                          <table className="w-full min-w-[640px] text-xs">
                            <thead><tr className="bg-gray-50 text-gray-500 font-semibold"><th className="px-3 py-2 text-left">Channel</th><th className="px-3 py-2 text-left">Deliverable</th><th className="px-3 py-2 text-left">SOP min</th><th className="px-3 py-2 text-center">Brief by</th><th className="px-3 py-2 text-center">Feasibility</th></tr></thead>
                            <tbody>
                              {LEAD_TIMES.map((row,ri)=>{
                                const briefBy=refDate?addDays(refDate,-row.leadDays):null, d=refDate?daysFromToday(briefBy):null
                                const feas=d===null?{label:"Set a date",cls:"bg-gray-100 text-gray-400"}:d<0?{label:`❌ Too late · ${Math.abs(d)}d past`,cls:"bg-red-100 text-red-800 font-semibold"}:d<=5?{label:`⚠️ Tight · ${d}d left`,cls:"bg-orange-100 text-orange-800 font-semibold"}:{label:`✅ On track · ${d}d left`,cls:"bg-green-100 text-green-800"}
                                return(<tr key={ri} className={`border-t border-gray-100 ${ri%2?"bg-gray-50":"bg-white"}`}><td className="px-3 py-2 font-semibold text-gray-700 whitespace-nowrap">{row.channel}</td><td className="px-3 py-2 text-gray-700">{row.deliverable}</td><td className="px-3 py-2 text-gray-500">{row.sop}</td><td className="px-3 py-2 text-center font-semibold text-blue-800 whitespace-nowrap">{refDate?fmtDate(briefBy):"—"}</td><td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded-full whitespace-nowrap ${feas.cls}`}>{feas.label}</span></td></tr>)
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* TIMELINE */}
        {tab==="timeline"&&(
          <div>
            <div className="mb-4"><h2 className="text-lg font-bold text-blue-900">Combined Marketing & Sales Timeline</h2><p className="text-xs text-gray-500">Each event shows the timeline for its category. Overdue and due-soon tasks are flagged against today.</p></div>
            {events.length===0&&<div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center text-gray-500">No events yet — add one in the Event Master tab.</div>}
            {events.map((ev,ei)=>{
              const evKey=`evt-${ev.id}`, isExp=expandedEvents[evKey]!==false
              const tasks=getTasks(ev.category)
              const enriched=tasks.map((t,idx)=>{
                const status=taskStatus[`${ev.id}-${idx}`]||"Not Started"
                const date=ev.startDate?addDays(ev.startDate,t.offset):null
                const di=dueInfo(date,status)
                return {...t,idx,status,date,di,visible:passFilters({team:t.team,owner:t.owner,status,date})}
              })
              const done=enriched.filter(t=>t.status==="Done").length
              const evOverdue=enriched.filter(t=>t.di&&t.di.kind==="overdue").length
              const visList=enriched.filter(t=>t.visible)
              const phaseOrder=[]; enriched.forEach(t=>{if(!phaseOrder.includes(t.phase))phaseOrder.push(t.phase)})
              return(
                <div key={ev.id} className="mb-6 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <button onClick={()=>togEv(evKey)} className="w-full bg-blue-900 text-white px-4 sm:px-5 py-4 flex items-center justify-between gap-2 hover:bg-blue-800">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-left"><span className="text-xs bg-blue-700 px-2 py-0.5 rounded">Event {ei+1}</span><span className="font-bold text-sm sm:text-base">{ev.name}</span><span className="text-xs bg-indigo-600 px-2 py-0.5 rounded hidden sm:inline">{catLabel(ev.category)}</span><span className="text-blue-300 text-xs sm:text-sm">{ev.startDate===ev.endDate?fmtDate(ev.startDate):`${fmtDate(ev.startDate)} – ${fmtDate(ev.endDate)}`}</span></div>
                    <div className="flex items-center gap-2"><span className="text-xs bg-green-600 px-2 py-1 rounded-full whitespace-nowrap">{done}/{tasks.length} done</span>{evOverdue>0&&<span className="text-xs bg-red-500 px-2 py-1 rounded-full whitespace-nowrap font-semibold">⏰ {evOverdue}</span>}<span className="text-blue-300">{isExp?"▲":"▼"}</span></div>
                  </button>
                  {isExp&&(
                    <div>
                      {isFiltering&&visList.length===0&&<div className="px-5 py-4 text-xs text-gray-400 bg-gray-50">No tasks match the current filters for this event.</div>}
                      {phaseOrder.map(phase=>{
                        const phAll=enriched.filter(t=>t.phase===phase)
                        const phVis=phAll.filter(t=>t.visible)
                        if(phVis.length===0) return null
                        const phKey=`${ev.id}-${phase}`, phExp=expandedPhases[phKey]!==false
                        const phDone=phAll.filter(t=>t.status==="Done").length
                        return(
                          <div key={phase}>
                            <button onClick={()=>togPh(phKey)} className={`w-full ${PH_COLOUR[phase]||"bg-gray-700"} text-white px-4 sm:px-5 py-2.5 flex items-center justify-between hover:opacity-90`}>
                              <span className="font-semibold text-sm">▶ {phase.toUpperCase()}</span>
                              <span className="text-xs opacity-75">{phDone}/{phAll.length} done{isFiltering&&phVis.length!==phAll.length?` · ${phVis.length} shown`:""} {phExp?"▲":"▼"}</span>
                            </button>
                            {phExp&&(
                              <div>
                                {/* Desktop table */}
                                <div className="hidden md:block overflow-x-auto">
                                  <table className="w-full min-w-[860px] table-auto">
                                    <thead><tr className="bg-gray-50 text-xs text-gray-500 font-semibold"><th className="px-3 py-2 text-left w-20">Timing</th><th className="px-3 py-2 text-left w-32">Date</th><th className="px-3 py-2 text-left w-24">Team</th><th className="px-3 py-2 text-left">Task</th><th className="px-3 py-2 text-left w-28">Owner</th><th className="px-3 py-2 text-left w-14">Pri</th><th className="px-3 py-2 text-center w-32">Status</th><th className="px-3 py-2 text-left w-52">Notes</th></tr></thead>
                                    <tbody>
                                      {phVis.map((t,ti)=>{
                                        const sk=`${ev.id}-${t.idx}`, team=TEAM[t.team]||TEAM.BOTH, alt=ti%2===1
                                        return(
                                          <tr key={t.idx} className={`border-t border-gray-100 align-top ${t.di?`border-l-4 ${t.di.accent}`:""} ${alt?team.bg:"bg-white"} hover:bg-yellow-50`}>
                                            <td className="px-3 py-2.5 text-xs font-mono text-gray-600 whitespace-nowrap">{t.label}</td>
                                            <td className="px-3 py-2.5 text-xs font-semibold text-blue-800"><div className="flex items-center flex-wrap gap-y-1">{ev.startDate?fmtDate(t.date):<span className="text-gray-400 italic">Set date</span>}<DueChip info={t.di}/></div></td>
                                            <td className="px-3 py-2.5"><span className={`text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap ${team.badge}`}>{team.label}</span></td>
                                            <td className="px-3 py-2.5 text-xs text-gray-800 font-medium">{t.task}{t.depends&&t.depends!=="—"&&<div className="text-gray-400 font-normal mt-0.5">↳ {t.depends}</div>}</td>
                                            <td className="px-3 py-2.5 text-xs font-semibold text-gray-700 whitespace-nowrap">{t.owner}</td>
                                            <td className="px-3 py-2.5"><span className={`text-xs px-1.5 py-0.5 rounded ${PRI[t.priority]||""}`}>{t.priority}</span></td>
                                            <td className="px-3 py-2.5 text-center"><StatusSelect value={t.status} onChange={v=>setTS(sk,v)} options={STATUS_OPTS}/></td>
                                            <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-normal break-words">{t.notes}</td>
                                          </tr>
                                        )
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                                {/* Mobile cards */}
                                <div className="md:hidden divide-y divide-gray-100">
                                  {phVis.map(t=>{
                                    const sk=`${ev.id}-${t.idx}`, team=TEAM[t.team]||TEAM.BOTH
                                    return(
                                      <div key={t.idx} className={`p-3 ${t.di?`border-l-4 ${t.di.accent}`:""} ${team.bg}`}>
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${team.badge}`}>{team.label}</span>
                                            <span className={`text-xs px-1.5 py-0.5 rounded ${PRI[t.priority]||""}`}>{t.priority}</span>
                                            <span className="text-xs font-mono text-gray-500">{t.label}</span>
                                          </div>
                                          <StatusSelect value={t.status} onChange={v=>setTS(sk,v)} options={STATUS_OPTS}/>
                                        </div>
                                        <div className="text-sm text-gray-800 font-medium">{t.task}</div>
                                        {t.depends&&t.depends!=="—"&&<div className="text-xs text-gray-400 mt-0.5">↳ {t.depends}</div>}
                                        <div className="flex items-center justify-between gap-2 mt-1.5 text-xs">
                                          <span className="font-semibold text-blue-800 flex items-center">{ev.startDate?fmtDate(t.date):<span className="text-gray-400 italic">Set date</span>}<DueChip info={t.di}/></span>
                                          <span className="font-semibold text-gray-600">{t.owner}</span>
                                        </div>
                                        {t.notes&&<div className="text-xs text-gray-500 mt-1">{t.notes}</div>}
                                      </div>
                                    )
                                  })}
                                </div>
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

        {/* COLLATERAL */}
        {tab==="collateral"&&(
          <div>
            <div className="mb-4"><h2 className="text-lg font-bold text-blue-900">Collateral & Creative Tracker</h2><p className="text-xs text-gray-500">Each event shows the collateral for its category. 📱 = Meta/SEM ad. Tania approval before publish. Publish dates flag overdue/due-soon.</p></div>
            {events.length===0&&<div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center text-gray-500">Add an event in the Event Master tab.</div>}
            {events.map((ev,ei)=>{
              const evKey=`coll-${ev.id}`, isExp=expandedEvents[evKey]!==false
              const items=getCollateral(ev.category)
              const enriched=items.map((item,idx)=>{
                const status=collStatus[`${ev.id}-${idx}`]||"Not Started"
                const designDate=ev.startDate?addDays(ev.startDate,item.designOff):null
                const pubDate=item.pubOff!==null&&item.pubOff!==undefined&&ev.startDate?addDays(ev.startDate,item.pubOff):null
                const di=dueInfo(pubDate,status)
                return {...item,idx,status,designDate,pubDate,di,visible:passFilters({team:null,owner:item.owner,status,date:pubDate})}
              })
              const done=enriched.filter(t=>["Done","Approved"].includes(t.status)).length
              const evOverdue=enriched.filter(t=>t.di&&t.di.kind==="overdue").length
              const vis=enriched.filter(t=>t.visible)
              const masterFolder=(artwork[ev.id]&&artwork[ev.id].masterFolder)||""
              return(
                <div key={ev.id} className="mb-6 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <button onClick={()=>togEv(evKey)} className="w-full bg-teal-800 text-white px-4 sm:px-5 py-4 flex items-center justify-between gap-2 hover:bg-teal-700">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-left"><span className="text-xs bg-teal-600 px-2 py-0.5 rounded">Event {ei+1}</span><span className="font-bold text-sm sm:text-base">{ev.name}</span><span className="text-xs bg-indigo-600 px-2 py-0.5 rounded hidden sm:inline">{catLabel(ev.category)}</span><span className="text-teal-300 text-xs sm:text-sm">{ev.startDate===ev.endDate?fmtDate(ev.startDate):`${fmtDate(ev.startDate)} – ${fmtDate(ev.endDate)}`}</span></div>
                    <div className="flex items-center gap-2"><span className="text-xs bg-green-600 px-2 py-1 rounded-full whitespace-nowrap">{done}/{items.length} approved</span>{evOverdue>0&&<span className="text-xs bg-red-500 px-2 py-1 rounded-full whitespace-nowrap font-semibold">⏰ {evOverdue}</span>}<span className="text-teal-300">{isExp?"▲":"▼"}</span></div>
                  </button>
                  {isExp&&(
                    <div>
                      <div className="bg-teal-50 border-b border-teal-100 px-4 py-2 flex items-center gap-2 text-xs flex-wrap">
                        <span className="font-semibold whitespace-nowrap text-teal-800">📁 Master artwork folder:</span>
                        <input value={masterFolder} onChange={e=>updateArt(ev.id,"masterFolder",e.target.value)} placeholder="Paste shared Google Drive folder link" className="flex-1 min-w-0 border border-teal-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-400"/>
                        {masterFolder&&<a href={masterFolder} target="_blank" rel="noreferrer" className="bg-teal-700 text-white px-3 py-1 rounded whitespace-nowrap hover:opacity-90">Open ↗</a>}
                      </div>
                      {isFiltering&&vis.length===0&&<div className="px-5 py-4 text-xs text-gray-400 bg-gray-50">No collateral matches the current filters for this event.</div>}
                      {/* Desktop table */}
                      {vis.length>0&&<div className="hidden md:block overflow-x-auto">
                        <table className="w-full min-w-[1040px] table-auto">
                          <thead><tr className="bg-gray-50 text-xs text-gray-500 font-semibold"><th className="px-3 py-2 text-left w-8">#</th><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-center">Type</th><th className="px-3 py-2 text-center">📱 Ad</th><th className="px-3 py-2 text-center">Design By</th><th className="px-3 py-2 text-center">Publish By</th><th className="px-3 py-2 text-center">Owner</th><th className="px-3 py-2 text-center">Approved</th><th className="px-3 py-2 text-center w-32">Status</th><th className="px-3 py-2 text-center">Artwork</th><th className="px-3 py-2 text-left w-44">Notes</th></tr></thead>
                          <tbody>
                            {vis.map((item)=>{
                              const idx=item.idx, sk=`${ev.id}-${idx}`
                              const flagged=!!metaFlag[sk]
                              return(
                                <tr key={idx} className={`border-t border-gray-100 align-top ${item.di?`border-l-4 ${item.di.accent}`:""} ${item.meta?"bg-purple-50":idx%2?"bg-blue-50":"bg-white"} hover:bg-yellow-50`}>
                                  <td className="px-3 py-2.5 text-xs text-gray-400">{idx+1}</td>
                                  <td className="px-3 py-2.5 text-xs font-semibold text-gray-800 whitespace-normal break-words">{item.name}{item.reuse&&<span className="ml-1 text-teal-600">★</span>}</td>
                                  <td className="px-3 py-2.5 text-center"><span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${item.meta?"bg-purple-100 text-purple-800 font-semibold":"bg-gray-100 text-gray-600"}`}>{item.type}</span></td>
                                  <td className="px-3 py-2.5 text-center">
                                    {item.meta?<span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">📱 Ad creative</span>
                                    :<button onClick={()=>togMeta(sk)} className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${flagged?"bg-purple-100 text-purple-800 font-semibold":"bg-gray-100 text-gray-400 hover:bg-purple-50 hover:text-purple-600"}`}>{flagged?"📱 Also on Meta":"+ Use for Meta"}</button>}
                                  </td>
                                  <td className="px-3 py-2.5 text-center text-xs font-semibold text-amber-700 whitespace-nowrap">{item.designDate?fmtDate(item.designDate):"—"}</td>
                                  <td className="px-3 py-2.5 text-center text-xs font-bold whitespace-nowrap"><div className="flex items-center justify-center flex-wrap"><span className="text-red-700">{item.pubDate?fmtDate(item.pubDate):"—"}</span><DueChip info={item.di}/></div></td>
                                  <td className="px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap">{item.owner}</td>
                                  <td className="px-3 py-2.5 text-center"><span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">TANIA</span></td>
                                  <td className="px-3 py-2.5 text-center"><StatusSelect value={item.status} onChange={v=>setCS(sk,v)} options={STATUS_OPTS_COLL}/></td>
                                  <td className="px-3 py-2.5">
                                    <ArtworkCell art={getArt(ev.id,idx)} onUpload={(img,name)=>updateArt(ev.id,idx,{img,name})} onLink={link=>updateArt(ev.id,idx,{link})} onClear={()=>updateArt(ev.id,idx,{img:null,name:null})} onView={a=>setLightbox(a)}/>
                                  </td>
                                  <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-normal break-words">{item.note}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                        <div className="px-4 py-2 text-xs text-gray-400 bg-gray-50">★ = reusable · 📱 = ad creative · Prefer Drive links over uploads for performance.</div>
                      </div>}
                      {/* Mobile cards */}
                      {vis.length>0&&<div className="md:hidden divide-y divide-gray-100">
                        {vis.map((item)=>{
                          const idx=item.idx, sk=`${ev.id}-${idx}`
                          const flagged=!!metaFlag[sk]
                          return(
                            <div key={idx} className={`p-3 ${item.di?`border-l-4 ${item.di.accent}`:""} ${item.meta?"bg-purple-50":"bg-white"}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="text-sm font-semibold text-gray-800">{idx+1}. {item.name}{item.reuse&&<span className="ml-1 text-teal-600">★</span>}</div>
                                <StatusSelect value={item.status} onChange={v=>setCS(sk,v)} options={STATUS_OPTS_COLL}/>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                                <span className={`text-xs px-2 py-0.5 rounded ${item.meta?"bg-purple-100 text-purple-800 font-semibold":"bg-gray-100 text-gray-600"}`}>{item.type}</span>
                                {item.meta?<span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">📱 Ad creative</span>
                                  :<button onClick={()=>togMeta(sk)} className={`text-xs px-2 py-0.5 rounded-full ${flagged?"bg-purple-100 text-purple-800 font-semibold":"bg-gray-100 text-gray-400"}`}>{flagged?"📱 Also on Meta":"+ Use for Meta"}</button>}
                                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">Appr: TANIA</span>
                              </div>
                              <div className="flex items-center justify-between gap-2 mt-2 text-xs">
                                <span className="text-amber-700 font-semibold">Design: {item.designDate?fmtDate(item.designDate):"—"}</span>
                                <span className="font-bold text-red-700 flex items-center">Publish: {item.pubDate?fmtDate(item.pubDate):"—"}<DueChip info={item.di}/></span>
                              </div>
                              <div className="flex items-center justify-between gap-2 mt-1.5">
                                <span className="text-xs font-semibold text-gray-600">Owner: {item.owner}</span>
                                <ArtworkCell art={getArt(ev.id,idx)} onUpload={(img,name)=>updateArt(ev.id,idx,{img,name})} onLink={link=>updateArt(ev.id,idx,{link})} onClear={()=>updateArt(ev.id,idx,{img:null,name:null})} onView={a=>setLightbox(a)}/>
                              </div>
                              {item.note&&<div className="text-xs text-gray-500 mt-1">{item.note}</div>}
                            </div>
                          )
                        })}
                        <div className="px-4 py-2 text-xs text-gray-400 bg-gray-50">★ = reusable · 📱 = ad creative · Prefer Drive links over uploads.</div>
                      </div>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {lightbox&&(
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-6" style={{zIndex:60}} onClick={()=>setLightbox(null)}>
          <div className="max-w-3xl flex flex-col items-center" onClick={e=>e.stopPropagation()}>
            <img src={lightbox.img} alt="ref" className="max-w-full rounded-lg shadow-2xl" style={{maxHeight:"80vh"}}/>
            <div className="flex justify-between items-center w-full mt-3 text-white text-xs gap-3">
              <span className="truncate">{lightbox.name||"Reference artwork"}</span>
              <div className="flex gap-2 flex-shrink-0">
                {lightbox.link&&<a href={lightbox.link} target="_blank" rel="noreferrer" className="bg-teal-600 hover:bg-teal-500 px-3 py-1.5 rounded">Open in Drive ↗</a>}
                <button onClick={()=>setLightbox(null)} className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
