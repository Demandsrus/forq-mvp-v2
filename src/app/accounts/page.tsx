'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

type Provider = 'ubereats' | 'doordash' | 'postmates' | 'grubhub'

interface LinkedAccount {
  provider: Provider
  external_user_id: string
  created_at: string
}

interface ConnectModalProps {
  provider: Provider
  isOpen: boolean
  onClose: () => void
  onConnect: (data: any) => void
}

const PROVIDERS = [
  {
    id: 'ubereats' as Provider,
    name: 'Uber Eats',
    description: 'Connect your Uber Eats account for personalized recommendations',
    color: 'bg-black text-white'
  },
  {
    id: 'doordash' as Provider,
    name: 'DoorDash',
    description: 'Link DoorDash to access your order history and preferences',
    color: 'bg-red-600 text-white'
  },
  {
    id: 'postmates' as Provider,
    name: 'Postmates',
    description: 'Connect Postmates for expanded restaurant options',
    color: 'bg-yellow-500 text-black'
  },
  {
    id: 'grubhub' as Provider,
    name: 'Grubhub',
    description: 'Link Grubhub to discover new restaurants and deals',
    color: 'bg-orange-600 text-white'
  }
]

function ConnectModal({ provider, isOpen, onClose, onConnect }: ConnectModalProps) {
  const [formData, setFormData] = useState({
    external_user_id: '',
    access_token: '',
    refresh_token: '',
    expires_at: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const providerInfo = PROVIDERS.find(p => p.id === provider)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.external_user_id.trim()) {
      toast.error('External User ID is required')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/accounts/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          external_user_id: formData.external_user_id,
          access_token: formData.access_token || undefined,
          refresh_token: formData.refresh_token || undefined,
          expires_at: formData.expires_at || undefined,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(`${providerInfo?.name} account connected successfully!`)
        onConnect(result)
        onClose()
        setFormData({
          external_user_id: '',
          access_token: '',
          refresh_token: '',
          expires_at: ''
        })
      } else {
        toast.error(result.error || 'Failed to connect account')
      }
    } catch (error) {
      console.error('Error connecting account:', error)
      toast.error('Failed to connect account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect {providerInfo?.name}</DialogTitle>
          <DialogDescription>
            Enter your {providerInfo?.name} account details to link your account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="external_user_id">
                External User ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="external_user_id"
                value={formData.external_user_id}
                onChange={(e) => setFormData(prev => ({ ...prev, external_user_id: e.target.value }))}
                placeholder="Your user ID on the platform"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="access_token">Access Token (Optional)</Label>
              <Input
                id="access_token"
                type="password"
                value={formData.access_token}
                onChange={(e) => setFormData(prev => ({ ...prev, access_token: e.target.value }))}
                placeholder="OAuth access token"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="refresh_token">Refresh Token (Optional)</Label>
              <Input
                id="refresh_token"
                type="password"
                value={formData.refresh_token}
                onChange={(e) => setFormData(prev => ({ ...prev, refresh_token: e.target.value }))}
                placeholder="OAuth refresh token"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expires_at">Expires At (Optional)</Label>
              <Input
                id="expires_at"
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Connect Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AccountsPage() {
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [connectModal, setConnectModal] = useState<{
    isOpen: boolean
    provider: Provider | null
  }>({
    isOpen: false,
    provider: null
  })

  const fetchLinkedAccounts = async () => {
    try {
      const response = await fetch('/api/accounts/list')
      const data = await response.json()
      
      if (response.ok) {
        setLinkedAccounts(data)
      } else {
        console.error('Failed to fetch linked accounts:', data.error)
      }
    } catch (error) {
      console.error('Error fetching linked accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLinkedAccounts()
  }, [])

  const handleConnect = (provider: Provider) => {
    setConnectModal({
      isOpen: true,
      provider
    })
  }

  const handleModalClose = () => {
    setConnectModal({
      isOpen: false,
      provider: null
    })
  }

  const handleAccountConnected = () => {
    fetchLinkedAccounts()
  }

  const isProviderLinked = (provider: Provider) => {
    return linkedAccounts.some(account => account.provider === provider)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Connected Accounts</h1>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Connected Accounts</h1>
          <p className="text-gray-600">
            Link your delivery platform accounts to get personalized recommendations and access your order history.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {PROVIDERS.map((provider) => {
            const isLinked = isProviderLinked(provider.id)
            
            return (
              <Card key={provider.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {provider.name}
                      {isLinked && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Connected
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                  <CardDescription>{provider.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleConnect(provider.id)}
                    variant={isLinked ? "outline" : "default"}
                    className={isLinked ? "" : provider.color}
                    disabled={isLinked}
                  >
                    {isLinked ? 'Connected' : 'Connect'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {connectModal.provider && (
          <ConnectModal
            provider={connectModal.provider}
            isOpen={connectModal.isOpen}
            onClose={handleModalClose}
            onConnect={handleAccountConnected}
          />
        )}
      </div>
    </div>
  )
}
