import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// 使用简单的状态提示，不依赖外部toast库

const Index = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)
  const [position, setPosition] = useState<number | null>(null)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null)

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({text, type})
    setTimeout(() => setMessage(null), 3000)
  }

  const joinWaitingList = async () => {
    if (!email || !name) {
      showMessage("Please fill in all fields", "error")
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      })

      const data = await response.json()

      if (response.ok) {
        setJoined(true)
        setPosition(data.position)
        showMessage(`Success! You're #${data.position} on the waiting list`, "success")
        fetchTotalCount()
      } else {
        showMessage(data.error || "Failed to join waiting list", "error")
      }
    } catch (error) {
      showMessage("Network error. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchTotalCount = async () => {
    try {
      const response = await fetch('/api/waitlist')
      const data = await response.json()
      if (response.ok) {
        setTotalCount(data.total)
      }
    } catch (error) {
      console.error('Failed to fetch total count:', error)
    }
  }

  const checkStatus = async () => {
    if (!email) {
      showMessage("Please enter your email", "error")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/waitlist/${encodeURIComponent(email)}`)
      const data = await response.json()

      if (response.ok) {
        setJoined(true)
        setPosition(data.position)
        setName(data.name)
        showMessage(`Found! You're #${data.position} on the waiting list`, "success")
        fetchTotalCount()
      } else {
        showMessage("Email not found in waiting list", "error")
      }
    } catch (error) {
      showMessage("Network error. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Join Our Waiting List
          </CardTitle>
          <CardDescription>
            Be the first to know when we launch!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}
          {!joined ? (
            <>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={joinWaitingList} 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Joining...' : 'Join Waiting List'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={checkStatus} 
                  disabled={loading}
                >
                  Check Status
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-4xl">🎉</div>
              <h3 className="text-lg font-semibold text-green-600">
                You're on the list!
              </h3>
              <p className="text-gray-600">
                <strong>{name}</strong>, you're #{position} in line
              </p>
              {totalCount && (
                <p className="text-sm text-gray-500">
                  {totalCount} people have joined so far
                </p>
              )}
              <Button 
                variant="outline" 
                onClick={() => {
                  setJoined(false)
                  setEmail('')
                  setName('')
                  setPosition(null)
                }}
                className="w-full"
              >
                Check Another Email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Index
