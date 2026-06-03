import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import useAuthStore from '@/stores/authStore'
import toast from 'react-hot-toast'

// Validate login form
const loginSchema = z.object({
  email: z.string().email('Email khong hop le'),
  password: z.string().min(1, 'Mat khau khong duoc trong'),
})

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    const result = await login(data.email, data.password)
    setIsLoading(false)

    if (result.success) {
      toast.success('Chao mung tro lai!')
      navigate('/')
    } else {
      toast.error(result.error || 'Dang nhap that bai')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            <span className="text-primary">24h</span>Story
          </CardTitle>
          <CardDescription>Chao mung ban tro lai. Dang nhap de tiep tuc.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-secondary">Email</label>
              <Input
                type="email"
                placeholder="ban@vi-du.com"
                {...register('email')}
                className={errors.email ? 'border-error' : ''}
              />
              {errors.email && (
                <p className="text-xs text-error">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-secondary">Mat khau</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhap mat khau"
                  {...register('password')}
                  className={errors.password ? 'border-error pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-text transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-error">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Dang dang nhap...' : 'Dang Nhap'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Link
            to="/forgot-password"
            className="text-sm text-secondary hover:text-primary transition-colors"
          >
            Quen mat khau?
          </Link>
          <p className="text-sm text-secondary">
            Chua co tai khoan?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Dang ky
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login
