import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Web3Wallet, TEST_NETWORKS, formatAddress, type NetworkKey } from '@/lib/web3'

const Index = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)
  const [position, setPosition] = useState<number | null>(null)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [verified, setVerified] = useState(false)
  
  // Web3 states
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkKey>('sepolia')
  const [signature, setSignature] = useState('')
  const [wallet, setWallet] = useState<Web3Wallet | null>(null)

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({text, type})
    setTimeout(() => setMessage(null), 3000)
  }

  // Initialize wallet on component mount
  useEffect(() => {
    if (Web3Wallet.isWalletInstalled()) {
      try {
        const walletInstance = new Web3Wallet()
        setWallet(walletInstance)
        
        // Check if already connected
        walletInstance.getAccounts().then(accounts => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0])
            setWalletConnected(true)
          }
        })
      } catch (error) {
        console.error('Failed to initialize wallet:', error)
      }
    }
  }, [])

  // Connect wallet
  const connectWallet = async () => {
    if (!wallet) {
      showMessage('No Web3 wallet detected. Please install MetaMask.', 'error')
      return
    }

    try {
      setLoading(true)
      const accounts = await wallet.connect()
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0])
        setWalletConnected(true)
        showMessage('Wallet connected successfully!', 'success')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet'
      showMessage(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Switch network
  const switchNetwork = async () => {
    if (!wallet) return

    try {
      setLoading(true)
      await wallet.switchNetwork(selectedNetwork)
      showMessage(`Switched to ${selectedNetwork} network`, 'success')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch network'
      showMessage(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Sign message
  const signMessage = async () => {
    if (!wallet || !walletAddress) {
      showMessage('Please connect your wallet first', 'error')
      return
    }

    try {
      setLoading(true)
      const messageToSign = 'Waiting for you!'
      const sig = await wallet.signMessage(messageToSign, walletAddress)
      setSignature(sig)
      showMessage('Message signed successfully!', 'success')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign message'
      showMessage(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const joinWaitingList = async () => {
    if (!email) {
      showMessage("Please enter your email", "error")
      return
    }

    if (!walletAddress) {
      showMessage("Please connect your wallet", "error")
      return
    }

    if (!signature) {
      showMessage("Please sign the message first", "error")
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          walletAddress,
          signature,
          network: selectedNetwork
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setJoined(true)
        setPosition(data.position)
        setNeedsVerification(data.needsVerification || false)
        setVerified(data.verified || false)
        
        if (data.needsVerification) {
          showMessage('Registration successful! Please check your email to verify your account.', "success")
        } else {
          showMessage(`Welcome! You're #${data.position} in the waiting list`, "success")
        }
        fetchTotalCount()
      } else {
        showMessage(data.error || "Failed to join waiting list", "error")
      }
    } catch (error) {
      console.error('Join waitlist error:', error)
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
      console.error('Check position error:', error)
      showMessage("Network error. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden'>
      {/* Background Forest Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Trees and Forest Elements */}
        <div className="absolute top-8 left-12 text-8xl opacity-20 floating forest-emoji" style={{animationDelay: '1s'}}>🌲</div>
        <div className="absolute top-16 right-20 text-7xl opacity-25 moving-slow-right forest-emoji" style={{animationDelay: '2s'}}>🌳</div>
        <div className="absolute bottom-28 left-16 text-9xl opacity-15 floating forest-emoji" style={{animationDelay: '3s'}}>🌲</div>
        <div className="absolute bottom-20 right-10 text-8xl opacity-30 moving-slow-left forest-emoji" style={{animationDelay: '1.5s'}}>🌳</div>
        
        {/* Mushrooms */}
        <div className="absolute top-1/3 left-8 text-5xl opacity-25 floating forest-emoji" style={{animationDelay: '0.5s'}}>🍄</div>
        <div className="absolute bottom-1/4 right-1/4 text-4xl opacity-20 moving-slow-up forest-emoji" style={{animationDelay: '4s'}}>🍄</div>
        <div className="absolute top-3/4 left-1/3 text-3xl opacity-15 floating forest-emoji" style={{animationDelay: '2.5s'}}>🍄</div>
        
        {/* Flowers and Plants */}
        <div className="absolute top-1/4 right-1/3 text-4xl opacity-30 floating forest-emoji" style={{animationDelay: '1.8s'}}>🌸</div>
        <div className="absolute bottom-1/3 left-1/2 text-3xl opacity-25 moving-slow-up forest-emoji" style={{animationDelay: '3.5s'}}>🌺</div>
        <div className="absolute top-2/3 right-1/5 text-4xl opacity-20 floating forest-emoji" style={{animationDelay: '0.8s'}}>🌼</div>
        <div className="absolute top-1/2 left-1/4 text-3xl opacity-15 moving-slow-right forest-emoji" style={{animationDelay: '2.2s'}}>🌻</div>
        
        {/* Leaves and Nature */}
        <div className="absolute top-20 left-1/3 text-3xl opacity-20 moving-slow-left forest-emoji" style={{animationDelay: '1.2s'}}>🍃</div>
        <div className="absolute bottom-40 right-1/3 text-4xl opacity-25 floating forest-emoji" style={{animationDelay: '4.2s'}}>🍃</div>
        <div className="absolute top-1/5 right-12 text-3xl opacity-15 moving-slow-right forest-emoji" style={{animationDelay: '3.8s'}}>🌿</div>
        <div className="absolute bottom-1/5 left-20 text-3xl opacity-30 floating forest-emoji" style={{animationDelay: '0.3s'}}>🌿</div>
        
        {/* Clouds */}
        <div className="absolute top-4 left-1/4 text-5xl opacity-15 moving-slow-right forest-emoji" style={{animationDelay: '5s'}}>☁️</div>
        <div className="absolute top-12 right-1/4 text-4xl opacity-25 moving-slow-left forest-emoji" style={{animationDelay: '6s'}}>☁️</div>
        <div className="absolute top-6 left-3/4 text-3xl opacity-20 moving-slow-right forest-emoji" style={{animationDelay: '7s'}}>☁️</div>
        
        {/* Forest Animals */}
        <div className="absolute top-1/2 right-8 text-3xl opacity-20 moving-slow-left forest-emoji" style={{animationDelay: '8s'}}>🦌</div>
        <div className="absolute bottom-1/4 left-1/5 text-3xl opacity-25 floating forest-emoji" style={{animationDelay: '9s'}}>🐰</div>
        <div className="absolute top-2/5 left-3/4 text-4xl opacity-15 moving-slow-up forest-emoji" style={{animationDelay: '10s'}}>🐻</div>
        <div className="absolute bottom-1/3 right-1/6 text-2xl opacity-30 floating forest-emoji" style={{animationDelay: '11s'}}>🦔</div>
        <div className="absolute top-3/5 left-1/6 text-2xl opacity-20 moving-slow-right forest-emoji" style={{animationDelay: '12s'}}>🐿️</div>
        
        {/* Slow Moving Elements */}
        <div className="absolute top-1/3 right-1/2 text-3xl opacity-15 moving-slow-right forest-emoji" style={{animationDelay: '2s'}}>🦋</div>
        <div className="absolute bottom-2/5 left-1/3 text-2xl opacity-25 moving-slow-left forest-emoji" style={{animationDelay: '4s'}}>🐝</div>
        <div className="absolute top-4/5 right-2/5 text-2xl opacity-20 moving-slow-up forest-emoji" style={{animationDelay: '6s'}}>🪶</div>
      </div>

      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Join Our Waiting List
          </CardTitle>
            <img 
              src="https://raw.githubusercontent.com/jhfnetboy/MarkDownImg/main/img/202509171600702.png" 
              alt="Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
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
              {/* Wallet Connection Section */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">1. Connect Your Wallet</h3>
                {!walletConnected ? (
                  <Button 
                    onClick={connectWallet} 
                  disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-800">
                        {formatAddress(walletAddress)}
                      </span>
                    </div>
                    <span className="text-xs text-green-600">Connected</span>
                  </div>
                )}
              </div>

              {/* Network Selection */}
              {walletConnected && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">2. Select Test Network</h3>
                  <div className="flex gap-2">
                    <Select value={selectedNetwork} onValueChange={(value: NetworkKey) => setSelectedNetwork(value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TEST_NETWORKS).map(([key, network]) => (
                          <SelectItem key={key} value={key}>
                            {network.chainName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={switchNetwork} 
                      disabled={loading}
                      variant="outline"
                    >
                      Switch
                    </Button>
                  </div>
                </div>
              )}

              {/* Message Signing */}
              {walletConnected && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">3. Sign Message</h3>
                  <div className="text-sm text-gray-600 p-3 bg-gray-100 rounded border-l-4 border-blue-500">
                    Message to sign: <strong>"Waiting for you!"</strong>
                  </div>
                  <div className="text-xs text-green-700 p-3 bg-green-50 rounded border border-green-200 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div>
                      <strong>🔒 Safe Off-Chain Operation:</strong> This signature is for verification only. 
                      No transactions will be submitted and no fees will be charged. Your wallet remains secure.
                    </div>
                  </div>
                  {!signature ? (
                    <Button 
                      onClick={signMessage} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Signing...' : 'Sign Message'}
                    </Button>
                  ) : (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-800">Message Signed</span>
                      </div>
                      <div className="text-xs text-gray-600 break-all">
                        {signature.slice(0, 20)}...{signature.slice(-20)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">4. Enter Your Email</h3>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Join Button */}
              <div className="flex gap-2">
                <Button 
                  onClick={joinWaitingList} 
                  disabled={loading || !walletConnected || !signature || !email}
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
