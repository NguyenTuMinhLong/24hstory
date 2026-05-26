import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await api.post('/auth/forgot-password', data)
      setIsSent(true)
      toast.success('Password reset email sent!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email')
    }
    setIsLoading(false)
  }

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Check Your Email</CardTitle>
            <CardDescription>
              If an account exists, we've sent a password reset link.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link to="/login" className="text-primary hover:underline">
              Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a reset link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-secondary">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className={errors.email ? 'border-error' : ''}
              />
              {errors.email && (
                <p className="text-xs text-error">{errors.email.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Link to="/login" className="text-sm text-secondary hover:text-primary">
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ForgotPassword
