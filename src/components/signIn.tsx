'use client'

import { useState } from 'react'
import { TernSecureAuth } from '@/auth'
import { setIDToken} from '@/actions/auth-server'

export interface SignInProps {
  onSuccess?: (user: any) => void
  onError?: (error: any) => void
  redirectUrl?: string
  className?: string
  customStyles?: {
    form?: string
    input?: string
    button?: string
    errorText?: string
  }
}

export function SignIn({ 
  onSuccess, 
  onError, 
  redirectUrl,
  className = '',
  customStyles = {}
}: SignInProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { user, idToken } = await TernSecureAuth.signIn(email, password)
      await setIDToken(idToken)
      onSuccess?.(user)
      if (redirectUrl) {
        window.location.href = redirectUrl
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in'
      setError(errorMessage)
      onError?.(err)
    } finally {
      setLoading(false)
    }
  }

  const defaultStyles = {
    form: 'space-y-4',
    input: 'w-full p-2 border rounded',
    button: 'w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50',
    errorText: 'text-red-500 text-sm'
  }

  const styles = {
    form: customStyles.form || defaultStyles.form,
    input: customStyles.input || defaultStyles.input,
    button: customStyles.button || defaultStyles.button,
    errorText: customStyles.errorText || defaultStyles.errorText
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`${styles.form} ${className}`}
      role="form"
    >
      {error && (
        <div className={styles.errorText}>{error}</div>
      )}
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className={styles.input}
          disabled={loading}
        />
      </div>
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className={styles.input}
          disabled={loading}
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className={styles.button}
        data-testid="submit-button"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}