import { useState, useMemo } from "react"
import { CATEGORIES } from "./data"

// ─── Category colours (full class strings so Tailwind JIT picks them up) ──────
const CAT_COLOR = {
  showcase: { bar:"bg-blue-600 text-white",    dot:"bg-blue-600",    soft:"bg-blue-100 text-blue-800 border-blue-200" },
  promo:    { bar:"bg-rose-600 text-white",    dot:"bg-rose-600",    soft:"bg-rose-100 text-rose-800 border-rose-200" },
  campaign: { bar:"bg-violet-600 text-white",  dot:"bg-violet-600",  soft:"bg-violet-100 text-violet-800 border-violet-200" },
  nurture:  { bar:"bg-emerald-600 text-white", dot:"bg-emerald-600", soft:"bg-emerald-100 text-emerald-800 border-emerald-200" },
  launch:   { bar:"bg-amber-500 text-white",   dot:"bg-amber-500",   soft:"bg-amber-100 text-amber-800 border-amber-200" },
  _default: { bar:"bg-gray-500 text-white",    dot:"bg-gray-500",    soft:"bg-gray-100 text-gray-700 border-gray-200" },
}
const colorOf = cat => CAT_COLOR[cat] || CAT_COLOR._default
const labelOf = cat => (CATEGORIES.find(c => c.key === cat)?.label) || "Showcase (default)"

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const WD = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]   // Monday-start week
const DAY = 86400000
const VIS_LANES = 3   // category bars shown per cell before "+N more"

// ─── Date helpers (local-midnight, timezone-safe) ────────────────────────────
function parseYMD(s) {
  if (!s || typeof s !== "string") return null
  const p = s.split("-"); const y=+p[0], m=+p[1], d=+p[2]
  if (!y || !m || !d) return null
  const dt = new Date(y, m-1, d); dt.setHours(0,0,0,0); return dt
}
function sameDay(a,b){ return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate() }
function fmtRange(s,e){
  const o={day:"numeric",month:"short"}
  if (sameDay(s,e)) return s.toLocaleDateString("en-SG",{...o,year:"numeric"})
  return `${s.toLocaleDateString("en-SG",o)} – ${e.toLocaleDateString("en-SG",{...o,year:"numeric"})}`
}
function fmtDay(d){ return d ? d.toLocaleDateString("en-SG",{weekday:"short",day:"numeric",month:"short",year:"numeric"}) : "—" }

// Build a Monday-start month grid; always ≥5 rows, 6th only if it holds month days.
function buildMatrix(year, month) {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7          // days since Monday
  const start = new Date(year, month, 1 - offset)
  const weeks = []
  const cur = new Date(start)
  for (let w=0; w<6; w++) {
    const row=[]
    for (let d=0; d<7; d++){ row.push(new Date(cur)); cur.setDate(cur.getDate()+1) }
    weeks.push(row)
  }
  return weeks.filter((row,i)=> i<5 || row.some(d=>d.getMonth()===month))
}

// Greedy lane packing so multi-day bars line up across cells.
function assignLanes(list) {
  const sorted=[...list].sort((a,b)=> a._start-b._start || b._span-a._span || (a.name||"").localeCompare(b.name||""))
  const laneEnd=[]
  sorted.forEach(ev=>{
    let placed=false
    for (let i=0;i<laneEnd.length;i++){
      if (laneEnd[i] < ev._start){ ev._lane=i; laneEnd[i]=ev._end; placed=true; break }
    }
    if (!placed){ ev._lane=laneEnd.length; laneEnd.push(ev._end) }
  })
  return sorted.length ? Math.max(...sorted.map(e=>e._lane)) : -1
}

export default function CalendarView({ events = [], onSelectEvent, onAddEvent }) {
  const today = useMemo(()=>{ const d=new Date(); d.setHours(0,0,0,0); return d }, [])
  const [cursor, setCursor] = useState(()=> new Date(today.getFullYear(), today.getMonth(), 1))
  const [dayModal, setDayModal] = useState(null)

  const year = cursor.getFullYear(), month = cursor.getMonth()

  // Enrich every event with parsed dates + a stable raw reference.
  const enriched = useMemo(()=> events.map(ev=>{
    const s = parseYMD(ev.startDate)
    let e = parseYMD(ev.endDate) || s
    if (s && e && e < s) e = s
    return { ...ev, _raw:ev, _start:s, _end:e, _go:parseYMD(ev.goLiveDate), _span: (s&&e) ? Math.round((e-s)/DAY)+1 : 1 }
  }).filter(ev=>ev._start), [events])

  const maxLane = useMemo(()=> assignLanes(enriched), [enriched])
  const lanesToRender = Math.min(maxLane + 1, VIS_LANES)

  const weeks = useMemo(()=> buildMatrix(year, month), [year, month])

  const eventsOn = d => enriched.filter(ev=> d>=ev._start && d<=ev._end)
  const goLivesOn = d => enriched.filter(ev=> ev._go && sameDay(ev._go, d))

  // Agenda + counts for the visible month.
  const mStart=new Date(year,month,1), mEnd=new Date(year,month+1,0)
  const monthEvents = enriched
    .filter(ev=> ev._end>=mStart && ev._start<=mEnd)
    .sort((a,b)=> a._start-b._start || (a.name||"").localeCompare(b.name||""))
  const goLiveCount = enriched.filter(ev=> ev._go && ev._go>=mStart && ev._go<=mEnd).length

  const prev = ()=> setCursor(new Date(year, month-1, 1))
  const next = ()=> setCursor(new Date(year, month+1, 1))
  const goToday = ()=> setCursor(new Date(today.getFullYear(), today.getMonth(), 1))

  const usedCats = [...new Set(enriched.map(e=>e.category))]

  return (
    <div>
      {/* ── Header / navigation ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button onClick={prev} className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center">‹</button>
          <div className="min-w-[170px] text-center">
            <div className="text-lg font-bold text-blue-900 leading-tight">{MONTHS[month]} {year}</div>
            <div className="text-xs text-gray-500">{monthEvents.length} event{monthEvents.length!==1?"s":""}{goLiveCount?` · ${goLiveCount} go-live${goLiveCount!==1?"s":""}`:""}</div>
          </div>
          <button onClick={next} className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center">›</button>
          <button onClick={goToday} className="ml-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 font-medium">Today</button>
        </div>
        {onAddEvent && (
          <button onClick={onAddEvent} className="bg-blue-900 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800">+ Add Event</button>
        )}
      </div>

      {/* ── Legend ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3 text-xs text-gray-600">
        {CATEGORIES.filter(c=>usedCats.includes(c.key)).map(c=>(
          <span key={c.key} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${colorOf(c.key).dot}`}/>{c.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5"><span className="text-amber-600">🚀</span>Campaign go-live</span>
      </div>

      {/* ── Month grid ────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {WD.map((d,i)=>(
            <div key={d} className={`px-2 py-2 text-center text-xs font-semibold ${i>=5?"text-gray-400":"text-gray-500"}`}>{d}</div>
          ))}
        </div>

        {weeks.map((row,wi)=>(
          <div key={wi} className="grid grid-cols-7">
            {row.map((date,di)=>{
              const inMonth = date.getMonth()===month
              const isToday = sameDay(date, today)
              const isWeekend = di>=5
              const isMonday = di===0
              const dayEvents = eventsOn(date)
              const golives = goLivesOn(date)
              const hidden = dayEvents.filter(e=>e._lane>=VIS_LANES).length
              const clickable = dayEvents.length>0 || golives.length>0
              return (
                <div
                  key={di}
                  onClick={clickable ? ()=>setDayModal(date) : undefined}
                  className={[
                    "min-h-[94px] border-b border-r border-gray-100 p-1.5 flex flex-col gap-1 transition-colors",
                    di===6 ? "border-r-0" : "",
                    !inMonth ? "bg-gray-50/60" : isWeekend ? "bg-gray-50/40" : "bg-white",
                    clickable ? "cursor-pointer hover:bg-yellow-50" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <span className={[
                      "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full",
                      isToday ? "bg-blue-900 text-white" : inMonth ? "text-gray-700" : "text-gray-300",
                    ].join(" ")}>{date.getDate()}</span>
                  </div>

                  {/* category lanes (aligned across the row) */}
                  <div className="flex flex-col gap-0.5">
                    {Array.from({length:lanesToRender}).map((_,lane)=>{
                      const ev = dayEvents.find(e=>e._lane===lane)
                      if (!ev) return <div key={lane} className="h-[15px]"/>
                      const isStart = sameDay(date, ev._start)
                      const isEnd = sameDay(date, ev._end)
                      const showName = isStart || isMonday
                      const cancelled = ev.status==="Cancelled"
                      const round = (ev._span===1) ? "rounded" : isStart ? "rounded-l" : isEnd ? "rounded-r" : ""
                      return (
                        <div
                          key={lane}
                          title={`${ev.name} — ${labelOf(ev.category)}`}
                          className={`h-[15px] text-[9px] leading-[15px] px-1 truncate ${round} ${colorOf(ev.category).bar} ${cancelled?"opacity-50 line-through":""}`}
                        >{showName ? ev.name : ""}</div>
                      )
                    })}
                    {hidden>0 && <div className="text-[9px] text-gray-500 font-medium pl-0.5">+{hidden} more</div>}
                  </div>

                  {/* go-live marker */}
                  {golives.length>0 && (
                    <div className="mt-auto text-[9px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1 py-0.5 truncate">
                      🚀 {golives.length===1 ? golives[0].name : `${golives.length} go-lives`}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* ── Agenda for the visible month ──────────────────────────────── */}
      <div className="mt-5">
        <h3 className="text-sm font-bold text-blue-900 mb-2">{MONTHS[month]} at a glance</h3>
        {monthEvents.length===0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center text-sm text-gray-500">
            No events this month. Use the Event Master tab to add one — it appears here automatically.
          </div>
        ) : (
          <div className="space-y-2">
            {monthEvents.map(ev=>{
              const c = colorOf(ev.category)
              const goThisMonth = ev._go && ev._go>=mStart && ev._go<=mEnd
              return (
                <div
                  key={ev.id}
                  onClick={onSelectEvent ? ()=>onSelectEvent(ev._raw) : undefined}
                  className={`bg-white border border-gray-200 rounded-lg p-3 flex items-start gap-3 ${onSelectEvent?"cursor-pointer hover:border-blue-300 hover:bg-blue-50/40":""}`}
                >
                  <span className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.dot}`}/>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800 truncate">{ev.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${c.soft}`}>{labelOf(ev.category)}</span>
                      {ev.status && ev.status!=="Confirmed" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{ev.status}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                      <span>📅 {fmtRange(ev._start, ev._end)}</span>
                      {ev.venue && <span>📍 {ev.venue}</span>}
                      {goThisMonth && <span className="text-amber-700">🚀 Go-live {fmtRange(ev._go, ev._go)}</span>}
                    </div>
                  </div>
                  {onSelectEvent && <span className="text-xs text-blue-600 flex-shrink-0">Edit ›</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Day detail modal ──────────────────────────────────────────── */}
      {dayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto" onClick={()=>setDayModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md my-8" onClick={e=>e.stopPropagation()}>
            <div className="bg-blue-900 text-white px-5 py-3 flex items-center justify-between rounded-t-xl">
              <span className="font-bold text-sm">{fmtDay(dayModal)}</span>
              <button onClick={()=>setDayModal(null)} className="text-blue-300 hover:text-white text-xl leading-none">✕</button>
            </div>
            <div className="p-4 space-y-2">
              {eventsOn(dayModal).map(ev=>{
                const c = colorOf(ev.category)
                return (
                  <div
                    key={ev.id}
                    onClick={onSelectEvent ? ()=>{ setDayModal(null); onSelectEvent(ev._raw) } : undefined}
                    className={`border border-gray-200 rounded-lg p-3 ${onSelectEvent?"cursor-pointer hover:border-blue-300 hover:bg-blue-50/40":""}`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`}/>
                      <span className="text-sm font-semibold text-gray-800">{ev.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${c.soft}`}>{labelOf(ev.category)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3">
                      <span>📅 {fmtRange(ev._start, ev._end)}</span>
                      {ev.venue && <span>📍 {ev.venue}</span>}
                    </div>
                    {onSelectEvent && <div className="text-xs text-blue-600 mt-1">Open in Event Master ›</div>}
                  </div>
                )
              })}
              {goLivesOn(dayModal).map(ev=>(
                <div key={`g-${ev.id}`} className="border border-amber-200 bg-amber-50 rounded-lg p-3">
                  <div className="text-sm font-semibold text-amber-800">🚀 Campaign go-live</div>
                  <div className="text-xs text-amber-700 mt-0.5">{ev.name}</div>
                </div>
              ))}
              {eventsOn(dayModal).length===0 && goLivesOn(dayModal).length===0 && (
                <div className="text-sm text-gray-400 text-center py-2">Nothing scheduled.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
