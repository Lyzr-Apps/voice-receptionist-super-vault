'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Phone, PhoneOff, Mic, MicOff, PhoneCall, Calendar, ShoppingBag, AlertCircle, Clock, Users, CheckCircle, XCircle, Loader2, Volume2 } from 'lucide-react'

// Theme Variables - Heritage Premium
const THEME_VARS = {
  '--background': '35 29% 95%',
  '--foreground': '30 22% 14%',
  '--card': '35 29% 92%',
  '--card-foreground': '30 22% 14%',
  '--popover': '35 29% 92%',
  '--popover-foreground': '30 22% 14%',
  '--primary': '27 61% 26%',
  '--primary-foreground': '35 29% 98%',
  '--secondary': '35 20% 88%',
  '--secondary-foreground': '30 22% 18%',
  '--muted': '35 15% 85%',
  '--muted-foreground': '30 20% 45%',
  '--accent': '43 75% 38%',
  '--accent-foreground': '35 29% 98%',
  '--destructive': '0 84% 60%',
  '--destructive-foreground': '0 0% 98%',
  '--border': '27 61% 26%',
  '--input': '35 15% 75%',
  '--ring': '27 61% 26%',
  '--radius': '0.5rem',
} as React.CSSProperties

// TypeScript Interfaces
interface CallLog {
  id: string
  timestamp: string
  duration: number
  intentType: 'reservation' | 'order' | 'complaint' | 'inquiry'
  summary: string
  status: 'completed' | 'in-progress' | 'missed'
  transcript: string
}

interface Reservation {
  id: string
  dateTime: string
  partySize: number
  customerName: string
  phone: string
  notes: string
  status: 'upcoming' | 'past' | 'cancelled'
}

interface Order {
  id: string
  orderTime: string
  pickupTime: string
  customerName: string
  phone: string
  items: { name: string; quantity: number; price: number }[]
  total: number
  status: 'pending' | 'ready' | 'picked-up'
}

interface Complaint {
  id: string
  date: string
  customerName: string
  phone: string
  issueSummary: string
  details: string
  resolutionStatus: 'unresolved' | 'in-progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
}

interface Stats {
  todaysCalls: number
  reservations: number
  orders: number
  complaints: number
}

// Mock Data
const generateMockCallLogs = (): CallLog[] => [
  {
    id: 'call-001',
    timestamp: '2026-02-12T09:15:00',
    duration: 125,
    intentType: 'reservation',
    summary: 'Table for 4 on Feb 14th at 7:00 PM',
    status: 'completed',
    transcript: 'Customer: Hi, I\'d like to make a reservation.\nReceptionist: Of course! When would you like to dine with us?\nCustomer: February 14th at 7 PM for 4 people.\nReceptionist: Perfect! I have you booked for Valentine\'s Day at 7 PM for a party of 4. May I have your name?\nCustomer: Sarah Johnson.\nReceptionist: Great! See you then, Sarah!'
  },
  {
    id: 'call-002',
    timestamp: '2026-02-12T10:30:00',
    duration: 89,
    intentType: 'order',
    summary: '2 Cappuccinos, 1 Croissant for pickup at 11:00 AM',
    status: 'completed',
    transcript: 'Customer: I\'d like to place an order for pickup.\nReceptionist: Absolutely! What can I get for you?\nCustomer: Two cappuccinos and one almond croissant.\nReceptionist: When would you like to pick it up?\nCustomer: In 30 minutes.\nReceptionist: Perfect! Your order will be ready at 11 AM.'
  },
  {
    id: 'call-003',
    timestamp: '2026-02-12T11:45:00',
    duration: 245,
    intentType: 'complaint',
    summary: 'Cold food and slow service yesterday',
    status: 'completed',
    transcript: 'Customer: I had a terrible experience yesterday.\nReceptionist: I\'m so sorry to hear that. Can you tell me what happened?\nCustomer: My food arrived cold and the service was incredibly slow.\nReceptionist: That\'s not the experience we want for our guests. Let me get your details and have our manager reach out to you.'
  },
  {
    id: 'call-004',
    timestamp: '2026-02-12T13:20:00',
    duration: 45,
    intentType: 'inquiry',
    summary: 'Asked about gluten-free menu options',
    status: 'completed',
    transcript: 'Customer: Do you have gluten-free options?\nReceptionist: Yes! We have several gluten-free items including salads, grilled proteins, and a gluten-free pasta dish.\nCustomer: Great, thank you!'
  },
  {
    id: 'call-005',
    timestamp: '2026-02-12T14:05:00',
    duration: 156,
    intentType: 'reservation',
    summary: 'Table for 6 on Feb 15th at 6:30 PM',
    status: 'completed',
    transcript: 'Customer: I need a table for 6 tomorrow evening.\nReceptionist: Let me check our availability. How does 6:30 PM sound?\nCustomer: That works perfectly.\nReceptionist: Wonderful! May I have your name and phone number?'
  }
]

const generateMockReservations = (): Reservation[] => [
  {
    id: 'res-001',
    dateTime: '2026-02-14T19:00:00',
    partySize: 4,
    customerName: 'Sarah Johnson',
    phone: '(555) 123-4567',
    notes: 'Window seat preferred. Anniversary celebration.',
    status: 'upcoming'
  },
  {
    id: 'res-002',
    dateTime: '2026-02-15T18:30:00',
    partySize: 6,
    customerName: 'Michael Chen',
    phone: '(555) 234-5678',
    notes: 'High chair needed for toddler.',
    status: 'upcoming'
  },
  {
    id: 'res-003',
    dateTime: '2026-02-11T20:00:00',
    partySize: 2,
    customerName: 'Emma Williams',
    phone: '(555) 345-6789',
    notes: 'Vegetarian options requested.',
    status: 'past'
  },
  {
    id: 'res-004',
    dateTime: '2026-02-13T19:30:00',
    partySize: 8,
    customerName: 'David Martinez',
    phone: '(555) 456-7890',
    notes: 'Business dinner. Quiet area preferred.',
    status: 'cancelled'
  }
]

const generateMockOrders = (): Order[] => [
  {
    id: 'order-001',
    orderTime: '2026-02-12T10:30:00',
    pickupTime: '2026-02-12T11:00:00',
    customerName: 'Alex Brown',
    phone: '(555) 567-8901',
    items: [
      { name: 'Cappuccino', quantity: 2, price: 4.50 },
      { name: 'Almond Croissant', quantity: 1, price: 3.75 }
    ],
    total: 12.75,
    status: 'picked-up'
  },
  {
    id: 'order-002',
    orderTime: '2026-02-12T12:15:00',
    pickupTime: '2026-02-12T12:45:00',
    customerName: 'Lisa Anderson',
    phone: '(555) 678-9012',
    items: [
      { name: 'Chicken Caesar Salad', quantity: 1, price: 12.99 },
      { name: 'Iced Latte', quantity: 1, price: 5.25 }
    ],
    total: 18.24,
    status: 'ready'
  },
  {
    id: 'order-003',
    orderTime: '2026-02-12T13:45:00',
    pickupTime: '2026-02-12T14:15:00',
    customerName: 'Robert Taylor',
    phone: '(555) 789-0123',
    items: [
      { name: 'Espresso', quantity: 3, price: 3.50 },
      { name: 'Chocolate Muffin', quantity: 2, price: 4.25 }
    ],
    total: 18.50,
    status: 'pending'
  }
]

const generateMockComplaints = (): Complaint[] => [
  {
    id: 'comp-001',
    date: '2026-02-12T11:45:00',
    customerName: 'Jennifer Davis',
    phone: '(555) 890-1234',
    issueSummary: 'Cold food and slow service',
    details: 'Visited on Feb 11th evening. Food arrived cold after 45-minute wait. Server seemed overwhelmed and inattentive.',
    resolutionStatus: 'in-progress',
    priority: 'high'
  },
  {
    id: 'comp-002',
    date: '2026-02-10T15:20:00',
    customerName: 'Thomas Wilson',
    phone: '(555) 901-2345',
    issueSummary: 'Incorrect order received',
    details: 'Ordered vegan pasta but received regular pasta with cheese. Had to wait for replacement.',
    resolutionStatus: 'resolved',
    priority: 'medium'
  },
  {
    id: 'comp-003',
    date: '2026-02-09T09:30:00',
    customerName: 'Patricia Moore',
    phone: '(555) 012-3456',
    issueSummary: 'Noisy environment during breakfast',
    details: 'Music was too loud for morning dining. Requested volume reduction but no change.',
    resolutionStatus: 'unresolved',
    priority: 'low'
  }
]

// Helper Components
function StatCard({ title, value, icon: Icon, trend }: { title: string; value: number; icon: any; trend?: string }) {
  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium font-sans text-foreground tracking-wide">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold font-serif text-foreground">{value}</div>
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
      </CardContent>
    </Card>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getIntentBadge(intent: string) {
  const variants: Record<string, { color: string; label: string }> = {
    reservation: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Reservation' },
    order: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Order' },
    complaint: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Complaint' },
    inquiry: { color: 'bg-purple-100 text-purple-800 border-purple-300', label: 'Inquiry' }
  }
  const variant = variants[intent] || variants.inquiry
  return <Badge className={`${variant.color} border`}>{variant.label}</Badge>
}

function getStatusBadge(status: string) {
  const variants: Record<string, { color: string; label: string }> = {
    completed: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Completed' },
    'in-progress': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'In Progress' },
    missed: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Missed' },
    upcoming: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Upcoming' },
    past: { color: 'bg-gray-100 text-gray-800 border-gray-300', label: 'Past' },
    cancelled: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Cancelled' },
    pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pending' },
    ready: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Ready' },
    'picked-up': { color: 'bg-green-100 text-green-800 border-green-300', label: 'Picked Up' },
    unresolved: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Unresolved' },
    resolved: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Resolved' }
  }
  const variant = variants[status] || { color: 'bg-gray-100 text-gray-800 border-gray-300', label: status }
  return <Badge className={`${variant.color} border`}>{variant.label}</Badge>
}

function getPriorityBadge(priority: string) {
  const variants: Record<string, { color: string; label: string }> = {
    low: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Low' },
    medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Medium' },
    high: { color: 'bg-red-100 text-red-800 border-red-300', label: 'High' }
  }
  const variant = variants[priority] || variants.medium
  return <Badge className={`${variant.color} border`}>{variant.label}</Badge>
}

export default function Home() {
  const [useSampleData, setUseSampleData] = useState(false)
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [stats, setStats] = useState<Stats>({ todaysCalls: 0, reservations: 0, orders: 0, complaints: 0 })
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Voice call state
  const [isConnected, setIsConnected] = useState(false)
  const [isInCall, setIsInCall] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string; timestamp: string }>>([])
  const [audioLevel, setAudioLevel] = useState(0)
  const [thinkingStatus, setThinkingStatus] = useState('')

  // Voice WebSocket refs
  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const nextPlayTimeRef = useRef(0)
  const isMutedRef = useRef(false)
  const sampleRateRef = useRef(24000)

  // Update sample data
  useEffect(() => {
    if (useSampleData) {
      const mockLogs = generateMockCallLogs()
      const mockRes = generateMockReservations()
      const mockOrders = generateMockOrders()
      const mockComp = generateMockComplaints()

      setCallLogs(mockLogs)
      setReservations(mockRes)
      setOrders(mockOrders)
      setComplaints(mockComp)
      setStats({
        todaysCalls: mockLogs.length,
        reservations: mockRes.filter(r => r.status === 'upcoming').length,
        orders: mockOrders.filter(o => o.status !== 'picked-up').length,
        complaints: mockComp.filter(c => c.resolutionStatus !== 'resolved').length
      })
    } else {
      setCallLogs([])
      setReservations([])
      setOrders([])
      setComplaints([])
      setStats({ todaysCalls: 0, reservations: 0, orders: 0, complaints: 0 })
    }
  }, [useSampleData])

  // Voice call functions
  const startVoiceCall = async () => {
    try {
      setCallStatus('connecting')
      setTranscript([])
      setThinkingStatus('')
      nextPlayTimeRef.current = 0

      // Step 1: Start session
      const response = await fetch('https://voice-sip.studio.lyzr.ai/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: '698ddc6d48eff0badfdf1a8f' })
      })

      if (!response.ok) {
        throw new Error(`Failed to start session: ${response.statusText}`)
      }

      const data = await response.json()
      const wsUrl = data?.wsUrl
      const sampleRate = data?.audioConfig?.sampleRate ?? 24000
      sampleRateRef.current = sampleRate

      if (!wsUrl) {
        throw new Error('No WebSocket URL received')
      }

      // Step 2: Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      // Step 3: Setup audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 })
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      // Create silent gain node to prevent mic echo
      const silentGain = audioContext.createGain()
      silentGain.gain.value = 0
      silentGain.connect(audioContext.destination)

      source.connect(processor)
      processor.connect(silentGain)

      // Step 4: Connect WebSocket
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setIsInCall(true)
        setCallStatus('connected')
        setTranscript(prev => [...prev, {
          speaker: 'System',
          text: 'Connected to Cafe Receptionist',
          timestamp: new Date().toISOString()
        }])
      }

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data)

          if (msg.type === 'audio' && msg.audio) {
            // Queue audio playback sequentially
            const audioData = Uint8Array.from(atob(msg.audio), c => c.charCodeAt(0))
            const audioBuffer = await audioContext.decodeAudioData(audioData.buffer)
            const sourceNode = audioContext.createBufferSource()
            sourceNode.buffer = audioBuffer
            sourceNode.connect(audioContext.destination)

            const now = audioContext.currentTime
            const startTime = Math.max(now, nextPlayTimeRef.current)
            sourceNode.start(startTime)
            nextPlayTimeRef.current = startTime + audioBuffer.duration
          } else if (msg.type === 'transcript' && msg.text) {
            setTranscript(prev => [...prev, {
              speaker: msg.role === 'user' ? 'You' : 'Receptionist',
              text: msg.text,
              timestamp: new Date().toISOString()
            }])
          } else if (msg.type === 'thinking') {
            setThinkingStatus('Receptionist is thinking...')
          } else if (msg.type === 'clear') {
            setThinkingStatus('')
          } else if (msg.type === 'error') {
            console.error('Voice error:', msg.error)
            setTranscript(prev => [...prev, {
              speaker: 'System',
              text: `Error: ${msg.error ?? 'Unknown error'}`,
              timestamp: new Date().toISOString()
            }])
          }
        } catch (err) {
          console.error('Error processing message:', err)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setCallStatus('error')
        setTranscript(prev => [...prev, {
          speaker: 'System',
          text: 'Connection error occurred',
          timestamp: new Date().toISOString()
        }])
      }

      ws.onclose = () => {
        setIsConnected(false)
        setIsInCall(false)
        setCallStatus('idle')
        nextPlayTimeRef.current = 0
        setTranscript(prev => [...prev, {
          speaker: 'System',
          text: 'Call ended',
          timestamp: new Date().toISOString()
        }])
      }

      // Step 5: Send audio to WebSocket
      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN && !isMutedRef.current) {
          const inputData = e.inputBuffer.getChannelData(0)
          const pcm16 = new Int16Array(inputData.length)

          let sum = 0
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]))
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
            sum += Math.abs(s)
          }

          // Update audio level indicator
          const avgLevel = sum / inputData.length
          setAudioLevel(Math.min(100, avgLevel * 200))

          const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)))
          ws.send(JSON.stringify({
            type: 'audio',
            audio: base64,
            sampleRate: 16000
          }))
        }
      }

    } catch (error) {
      console.error('Error starting call:', error)
      setCallStatus('error')
      setTranscript(prev => [...prev, {
        speaker: 'System',
        text: `Failed to start call: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }])
      endVoiceCall()
    }
  }

  const endVoiceCall = () => {
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    // Stop audio processing
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Stop microphone
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    setIsConnected(false)
    setIsInCall(false)
    setCallStatus('idle')
    setIsMuted(false)
    isMutedRef.current = false
    nextPlayTimeRef.current = 0
    setAudioLevel(0)
    setThinkingStatus('')
  }

  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    isMutedRef.current = newMutedState
  }

  // Filtered data
  const filteredCallLogs = Array.isArray(callLogs) ? callLogs.filter(log =>
    (statusFilter === 'all' || log.status === statusFilter) &&
    (searchTerm === '' ||
      log.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.intentType.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : []

  const filteredReservations = Array.isArray(reservations) ? reservations.filter(res =>
    (statusFilter === 'all' || res.status === statusFilter) &&
    (searchTerm === '' ||
      res.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.phone.includes(searchTerm))
  ) : []

  const filteredOrders = Array.isArray(orders) ? orders.filter(order =>
    (statusFilter === 'all' || order.status === statusFilter) &&
    (searchTerm === '' ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm))
  ) : []

  const filteredComplaints = Array.isArray(complaints) ? complaints.filter(comp =>
    (statusFilter === 'all' || comp.resolutionStatus === statusFilter) &&
    (searchTerm === '' ||
      comp.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.issueSummary.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : []

  return (
    <div style={THEME_VARS} className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <PhoneCall className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-semibold text-foreground tracking-wide">Heritage Cafe</h1>
              <p className="text-xs text-muted-foreground font-sans">AI Voice Receptionist Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm text-muted-foreground font-sans">
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>

            {/* Sample Data Toggle */}
            <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-lg">
              <Label htmlFor="sample-toggle" className="text-sm font-medium text-foreground cursor-pointer font-sans">
                Sample Data
              </Label>
              <button
                id="sample-toggle"
                onClick={() => setUseSampleData(!useSampleData)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  useSampleData ? 'bg-primary' : 'bg-input'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useSampleData ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {/* Voice Call Interface */}
        <Card className="mb-6 bg-gradient-to-br from-[hsl(27,61%,26%)] to-[hsl(27,61%,20%)] border-border shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-serif font-semibold text-primary-foreground mb-2 tracking-wide">
                  Voice Receptionist
                </h3>
                <p className="text-sm text-primary-foreground/80 font-sans leading-relaxed">
                  {callStatus === 'idle' && 'Click to connect with our AI receptionist'}
                  {callStatus === 'connecting' && 'Establishing connection...'}
                  {callStatus === 'connected' && isInCall && 'Call in progress - speak naturally'}
                  {callStatus === 'error' && 'Connection error - please try again'}
                </p>
                {thinkingStatus && (
                  <p className="text-xs text-accent-foreground mt-1 flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {thinkingStatus}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Audio Level Indicator */}
                {isInCall && (
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-primary-foreground/60" />
                    <div className="w-24 h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all duration-100"
                        style={{ width: `${audioLevel}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Call Controls */}
                {!isInCall ? (
                  <Button
                    onClick={startVoiceCall}
                    disabled={callStatus === 'connecting'}
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground font-sans font-medium tracking-wide shadow-lg"
                  >
                    {callStatus === 'connecting' ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Phone className="mr-2 h-5 w-5" />
                        Call Receptionist
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={toggleMute}
                      variant="secondary"
                      size="lg"
                      className={`${isMuted ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-secondary hover:bg-secondary/90'} font-sans`}
                    >
                      {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button
                      onClick={endVoiceCall}
                      variant="destructive"
                      size="lg"
                      className="bg-destructive hover:bg-destructive/90 font-sans font-medium tracking-wide"
                    >
                      <PhoneOff className="mr-2 h-5 w-5" />
                      End Call
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Live Transcript */}
            {transcript.length > 0 && (
              <div className="mt-4 bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4 max-h-40 overflow-y-auto">
                <h4 className="text-sm font-semibold text-primary-foreground mb-2 font-sans">Live Transcript</h4>
                <div className="space-y-2">
                  {transcript.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium text-accent-foreground font-sans">{item.speaker}:</span>{' '}
                      <span className="text-primary-foreground/90 font-sans">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard title="Today's Calls" value={stats.todaysCalls} icon={PhoneCall} trend="+12% from yesterday" />
          <StatCard title="Active Reservations" value={stats.reservations} icon={Calendar} trend="Next: Today 7:00 PM" />
          <StatCard title="Pending Orders" value={stats.orders} icon={ShoppingBag} trend="2 ready for pickup" />
          <StatCard title="Open Complaints" value={stats.complaints} icon={AlertCircle} trend="1 high priority" />
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="Search by customer name, phone, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md bg-input border-border text-foreground placeholder:text-muted-foreground font-sans"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-input border-border text-foreground font-sans">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="calls" className="space-y-6">
          <TabsList className="bg-card border border-border shadow-sm">
            <TabsTrigger value="calls" className="font-sans data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All Calls
            </TabsTrigger>
            <TabsTrigger value="reservations" className="font-sans data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Reservations
            </TabsTrigger>
            <TabsTrigger value="orders" className="font-sans data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Orders
            </TabsTrigger>
            <TabsTrigger value="complaints" className="font-sans data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Complaints
            </TabsTrigger>
          </TabsList>

          {/* All Calls Tab */}
          <TabsContent value="calls">
            <Card className="bg-card border-border shadow-md">
              <CardHeader>
                <CardTitle className="font-serif text-foreground tracking-wide">Call Logs</CardTitle>
                <CardDescription className="font-sans text-muted-foreground">Complete history of customer interactions</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredCallLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <PhoneCall className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground font-sans">No call logs yet. Enable sample data or make a call to get started.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {filteredCallLogs.map((log) => (
                        <div
                          key={log.id}
                          onClick={() => setSelectedCall(log)}
                          className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground font-sans">{formatDate(log.timestamp)}</span>
                              <span className="text-sm text-muted-foreground font-mono">{formatDuration(log.duration)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getIntentBadge(log.intentType)}
                              {getStatusBadge(log.status)}
                            </div>
                          </div>
                          <p className="text-foreground font-sans leading-relaxed">{log.summary}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reservations Tab */}
          <TabsContent value="reservations">
            <Card className="bg-card border-border shadow-md">
              <CardHeader>
                <CardTitle className="font-serif text-foreground tracking-wide">Reservations</CardTitle>
                <CardDescription className="font-sans text-muted-foreground">Manage table bookings and party details</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredReservations.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground font-sans">No reservations found. Enable sample data to see examples.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {filteredReservations.map((res) => (
                        <div
                          key={res.id}
                          onClick={() => setSelectedReservation(res)}
                          className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-foreground font-sans">{formatDate(res.dateTime)}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground font-sans">Party of {res.partySize}</span>
                              </div>
                            </div>
                            {getStatusBadge(res.status)}
                          </div>
                          <p className="font-medium text-foreground mb-1 font-sans">{res.customerName}</p>
                          <p className="text-sm text-muted-foreground font-mono">{res.phone}</p>
                          {res.notes && <p className="text-sm text-muted-foreground mt-2 font-sans italic">{res.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="bg-card border-border shadow-md">
              <CardHeader>
                <CardTitle className="font-serif text-foreground tracking-wide">Takeout Orders</CardTitle>
                <CardDescription className="font-sans text-muted-foreground">Track order status and pickup times</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground font-sans">No orders found. Enable sample data to see examples.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {filteredOrders.map((order) => (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-foreground mb-1 font-sans">{order.customerName}</p>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className="font-sans">Pickup: {formatDate(order.pickupTime)}</span>
                              </div>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <p className="text-sm text-muted-foreground font-sans">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </p>
                            <p className="font-semibold text-foreground font-sans">${order.total.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Complaints Tab */}
          <TabsContent value="complaints">
            <Card className="bg-card border-border shadow-md">
              <CardHeader>
                <CardTitle className="font-serif text-foreground tracking-wide">Customer Complaints</CardTitle>
                <CardDescription className="font-sans text-muted-foreground">Track and resolve customer issues</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredComplaints.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground font-sans">No complaints found. Enable sample data to see examples.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {filteredComplaints.map((comp) => (
                        <div
                          key={comp.id}
                          onClick={() => setSelectedComplaint(comp)}
                          className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-foreground mb-1 font-sans">{comp.customerName}</p>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className="font-sans">{formatDate(comp.date)}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getPriorityBadge(comp.priority)}
                              {getStatusBadge(comp.resolutionStatus)}
                            </div>
                          </div>
                          <p className="text-foreground font-sans leading-relaxed mt-2">{comp.issueSummary}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Agent Info */}
        <Card className="mt-6 bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${callStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <div>
                  <p className="text-sm font-medium text-foreground font-sans">Agent: Cafe Receptionist Agent</p>
                  <p className="text-xs text-muted-foreground font-sans">ID: 698ddc6d48eff0badfdf1a8f • Type: Voice (WebSocket)</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-sans">
                Status: {callStatus === 'idle' && 'Ready'}{callStatus === 'connecting' && 'Connecting'}{callStatus === 'connected' && 'Active'}{callStatus === 'error' && 'Error'}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Call Detail Modal */}
      <Dialog open={selectedCall !== null} onOpenChange={() => setSelectedCall(null)}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground tracking-wide">Call Details</DialogTitle>
            <DialogDescription className="font-sans text-muted-foreground">
              {selectedCall && formatDate(selectedCall.timestamp)}
            </DialogDescription>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-sans text-foreground">Duration: {formatDuration(selectedCall.duration)}</span>
                </div>
                {getIntentBadge(selectedCall.intentType)}
                {getStatusBadge(selectedCall.status)}
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground font-sans">Summary</Label>
                <p className="text-foreground mt-1 font-sans leading-relaxed">{selectedCall.summary}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground font-sans">Transcript</Label>
                <ScrollArea className="h-64 mt-2 p-4 bg-muted rounded-lg border border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{selectedCall.transcript}</p>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reservation Detail Modal */}
      <Dialog open={selectedReservation !== null} onOpenChange={() => setSelectedReservation(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground tracking-wide">Reservation Details</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground font-sans">Customer</Label>
                  <p className="text-foreground font-medium font-sans">{selectedReservation.customerName}</p>
                  <p className="text-sm text-muted-foreground font-mono">{selectedReservation.phone}</p>
                </div>
                {getStatusBadge(selectedReservation.status)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground font-sans">Date & Time</Label>
                  <p className="text-foreground font-sans">{formatDate(selectedReservation.dateTime)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground font-sans">Party Size</Label>
                  <p className="text-foreground font-sans">{selectedReservation.partySize} guests</p>
                </div>
              </div>
              {selectedReservation.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground font-sans">Special Requests</Label>
                  <p className="text-foreground mt-1 font-sans leading-relaxed">{selectedReservation.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Detail Modal */}
      <Dialog open={selectedOrder !== null} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground tracking-wide">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground font-sans">Customer</Label>
                  <p className="text-foreground font-medium font-sans">{selectedOrder.customerName}</p>
                  <p className="text-sm text-muted-foreground font-mono">{selectedOrder.phone}</p>
                </div>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground font-sans">Order Time</Label>
                  <p className="text-sm text-foreground font-sans">{formatDate(selectedOrder.orderTime)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground font-sans">Pickup Time</Label>
                  <p className="text-sm text-foreground font-sans">{formatDate(selectedOrder.pickupTime)}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground font-sans mb-2 block">Items</Label>
                <div className="space-y-2">
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded border border-border">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground font-sans">{item.quantity}x</span>
                        <span className="text-sm text-foreground font-sans">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground font-sans">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Label className="text-base font-semibold text-foreground font-sans">Total</Label>
                <p className="text-xl font-bold text-foreground font-sans">${selectedOrder.total.toFixed(2)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Complaint Detail Modal */}
      <Dialog open={selectedComplaint !== null} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground tracking-wide">Complaint Details</DialogTitle>
            <DialogDescription className="font-sans text-muted-foreground">
              {selectedComplaint && formatDate(selectedComplaint.date)}
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground font-sans">Customer</Label>
                  <p className="text-foreground font-medium font-sans">{selectedComplaint.customerName}</p>
                  <p className="text-sm text-muted-foreground font-mono">{selectedComplaint.phone}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getPriorityBadge(selectedComplaint.priority)}
                  {getStatusBadge(selectedComplaint.resolutionStatus)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground font-sans">Issue Summary</Label>
                <p className="text-foreground mt-1 font-sans leading-relaxed">{selectedComplaint.issueSummary}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground font-sans">Full Details</Label>
                <ScrollArea className="h-32 mt-2 p-4 bg-muted rounded-lg border border-border">
                  <p className="text-sm text-foreground font-sans leading-relaxed">{selectedComplaint.details}</p>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
