import { useEffect, useState } from 'react'
import Spline from '@splinetool/react-spline'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

function Nav() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur border-b border-white/30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600" />
          <span className="font-semibold">AI Sales Training</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-700">
          <a href="#videos" className="hover:text-black">Videos</a>
          <a href="#community" className="hover:text-black">Community</a>
          <a href="#resources" className="hover:text-black">Resources</a>
          <a href="#admin" className="hover:text-black">Admin</a>
        </div>
        <a href="#subscribe" className="px-4 py-2 rounded-md bg-black text-white text-sm">Subscribe $49/mo</a>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      <Spline scene="https://prod.spline.design/IKzHtP5ThSO83edK/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center max-w-3xl px-6">
        <h1 className="text-3xl md:text-5xl font-semibold text-gray-900">Level up your sales game with AI</h1>
        <p className="mt-3 text-gray-700">Bite-sized video lessons, community playbooks, and a living prompt library. Subscribe monthly, cancel anytime.</p>
        <a href="#subscribe" className="inline-block mt-6 px-6 py-3 rounded-lg bg-blue-600 text-white">Get Started — $49/mo</a>
      </div>
    </section>
  )
}

function SubscribeSection() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState('')
  const [provider, setProvider] = useState('stripe')
  const [checkoutUrl, setCheckoutUrl] = useState('')

  const register = async () => {
    setStatus('Registering...')
    const r = await fetch(`${BACKEND_URL}/api/members/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    })
    if (!r.ok) {
      const msg = await r.json().catch(()=>({detail:'Error'}))
      setStatus(msg.detail || 'Already registered or error')
    } else {
      setStatus('Registered. Initiating subscription...')
      startSubscription()
    }
  }

  const startSubscription = async () => {
    const r = await fetch(`${BACKEND_URL}/api/subscribe`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, provider })
    })
    const data = await r.json()
    setStatus(data.message + (data.checkout_url ? ' — redirecting' : ''))
    if (data.checkout_url) {
      setCheckoutUrl(data.checkout_url)
      window.open(data.checkout_url, '_blank')
    }
  }

  return (
    <section id="subscribe" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-semibold">Subscribe</h2>
        <p className="text-gray-600">Choose Stripe, PayPal, or request an invoice. $49/month, cancel anytime.</p>
        <div className="mt-6 grid md:grid-cols-4 gap-3">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="border rounded px-3 py-2" />
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="border rounded px-3 py-2 md:col-span-2" />
          <select value={provider} onChange={e=>setProvider(e.target.value)} className="border rounded px-3 py-2">
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
            <option value="invoice">Invoice</option>
          </select>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={register} className="px-4 py-2 bg-black text-white rounded">Start</button>
          {checkoutUrl && <a className="px-4 py-2 border rounded" href={checkoutUrl} target="_blank">Open Checkout</a>}
        </div>
        {status && <p className="mt-3 text-sm text-gray-700">{status}</p>}
      </div>
    </section>
  )
}

function Videos() {
  const [videos, setVideos] = useState([])
  useEffect(()=>{
    fetch(`${BACKEND_URL}/api/videos`).then(r=>r.json()).then(setVideos)
  },[])
  return (
    <section id="videos" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-semibold">Video Library</h2>
        <p className="text-gray-600">Watch training videos hosted on Vimeo.</p>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(v => (
            <div key={v._id} className="bg-white rounded-lg shadow p-4">
              <div className="aspect-video w-full rounded overflow-hidden bg-black">
                <iframe src={`https://player.vimeo.com/video/${v.vimeo_id}`} className="w-full h-full" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>
              </div>
              <h3 className="mt-3 font-medium">{v.title}</h3>
              {v.description && <p className="text-sm text-gray-600">{v.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Community() {
  const [channel, setChannel] = useState('general')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [messages, setMessages] = useState([])

  const load = async () => {
    const r = await fetch(`${BACKEND_URL}/api/messages?channel=${channel}`)
    const data = await r.json()
    setMessages(data)
  }

  useEffect(()=>{ load() },[channel])

  const post = async () => {
    await fetch(`${BACKEND_URL}/api/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_email: email, content, channel })
    })
    setContent('')
    load()
  }

  return (
    <section id="community" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Community</h2>
            <p className="text-gray-600">Share insights, wins, and questions.</p>
          </div>
          <select value={channel} onChange={e=>setChannel(e.target.value)} className="border rounded px-3 py-2">
            <option value="general">#general</option>
            <option value="wins">#wins</option>
            <option value="qa">#qa</option>
          </select>
        </div>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gray-50 rounded-lg p-4 border">
            <div className="space-y-3 max-h-96 overflow-auto">
              {messages.map(m => (
                <div key={m._id} className="bg-white border rounded p-3">
                  <div className="text-xs text-gray-500">{m.member_email} • {new Date(m.created_at || Date.now()).toLocaleString()}</div>
                  <div className="mt-1">{m.content}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your member email" className="w-full border rounded px-3 py-2" />
            <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Write a message" className="w-full border rounded px-3 py-2 mt-2 h-24" />
            <button onClick={post} className="mt-2 w-full bg-black text-white rounded px-4 py-2">Post</button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Resources() {
  const [resources, setResources] = useState([])
  useEffect(()=>{ fetch(`${BACKEND_URL}/api/resources`).then(r=>r.json()).then(setResources) },[])
  return (
    <section id="resources" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-semibold">Resources</h2>
        <p className="text-gray-600">Prompt library and helpful tools.</p>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(r => (
            <a key={r._id} href={r.url || '#'} target="_blank" className="bg-white rounded-lg shadow p-4 border hover:shadow-md transition">
              <div className="text-xs uppercase tracking-wide text-gray-500">{r.type}</div>
              <div className="mt-1 font-medium">{r.title}</div>
              {r.description && <div className="text-sm text-gray-600 mt-1">{r.description}</div>}
              {Array.isArray(r.tags) && r.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">{r.tags.map(t => <span key={t} className="text-xs bg-gray-100 rounded px-2 py-0.5">{t}</span>)}</div>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function Admin() {
  const [adminEmail, setAdminEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [members, setMembers] = useState([])
  const [form, setForm] = useState({ title:'', vimeo_id:'', description:'' })
  const [resForm, setResForm] = useState({ title:'', type:'prompt', url:'', description:'', tags:'' })

  const check = async () => {
    const r = await fetch(`${BACKEND_URL}/api/admin/is_admin?email=${adminEmail}`)
    const data = await r.json()
    setIsAdmin(!!data.is_admin)
  }

  const loadMembers = async () => {
    const r = await fetch(`${BACKEND_URL}/api/members`, { headers: { 'x-admin-email': adminEmail } })
    if (r.ok) setMembers(await r.json())
  }

  const addVideo = async () => {
    await fetch(`${BACKEND_URL}/api/videos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-email': adminEmail },
      body: JSON.stringify(form)
    })
    setForm({ title:'', vimeo_id:'', description:'' })
  }

  const addResource = async () => {
    const payload = { ...resForm, tags: resForm.tags ? resForm.tags.split(',').map(s=>s.trim()) : [] }
    await fetch(`${BACKEND_URL}/api/resources`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-email': adminEmail },
      body: JSON.stringify(payload)
    })
    setResForm({ title:'', type:'prompt', url:'', description:'', tags:'' })
  }

  return (
    <section id="admin" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-semibold">Admin</h2>
        {!isAdmin ? (
          <div className="mt-4 flex gap-2">
            <input value={adminEmail} onChange={e=>setAdminEmail(e.target.value)} placeholder="Admin email" className="border rounded px-3 py-2" />
            <button onClick={check} className="px-4 py-2 bg-black text-white rounded">Check</button>
          </div>
        ) : (
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">Members</div>
                <button onClick={loadMembers} className="text-sm px-3 py-1 border rounded">Refresh</button>
              </div>
              <div className="mt-3 max-h-64 overflow-auto space-y-2">
                {members.map(m => (
                  <div key={m._id} className="text-sm border rounded p-2 flex justify-between">
                    <div>
                      <div className="font-medium">{m.name}</div>
                      <div className="text-gray-600">{m.email} • {m.role} • {m.subscription_status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <div className="font-medium">Add Video</div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title" className="border rounded px-3 py-2 col-span-2" />
                  <input value={form.vimeo_id} onChange={e=>setForm({...form, vimeo_id:e.target.value})} placeholder="Vimeo ID" className="border rounded px-3 py-2 col-span-1" />
                  <input value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Description" className="border rounded px-3 py-2 col-span-1" />
                </div>
                <button onClick={addVideo} className="mt-2 px-4 py-2 bg-black text-white rounded">Add</button>
              </div>

              <div className="border rounded-lg p-4">
                <div className="font-medium">Add Resource</div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input value={resForm.title} onChange={e=>setResForm({...resForm, title:e.target.value})} placeholder="Title" className="border rounded px-3 py-2 col-span-2" />
                  <select value={resForm.type} onChange={e=>setResForm({...resForm, type:e.target.value})} className="border rounded px-3 py-2 col-span-1">
                    <option value="prompt">Prompt</option>
                    <option value="tool">Tool</option>
                  </select>
                  <input value={resForm.url} onChange={e=>setResForm({...resForm, url:e.target.value})} placeholder="URL" className="border rounded px-3 py-2 col-span-1" />
                  <input value={resForm.description} onChange={e=>setResForm({...resForm, description:e.target.value})} placeholder="Description" className="border rounded px-3 py-2 col-span-2" />
                  <input value={resForm.tags} onChange={e=>setResForm({...resForm, tags:e.target.value})} placeholder="tags, comma,separated" className="border rounded px-3 py-2 col-span-2" />
                </div>
                <button onClick={addResource} className="mt-2 px-4 py-2 bg-black text-white rounded">Add</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Nav />
      <Hero />
      <SubscribeSection />
      <Videos />
      <Community />
      <Resources />
      <Admin />
      <footer className="py-10 border-t text-center text-sm text-gray-600">© {new Date().getFullYear()} AI Sales Training</footer>
    </div>
  )
}
