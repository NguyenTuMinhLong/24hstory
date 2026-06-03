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

// Validate register form
const registerSchema = z.object({
  email: z.string().email('Email khong hop le'),
  password: z
    .string()
    .min(8, 'Mat khau it nhat 8 ky tu')
    .regex(/[A-Z]/, 'Phai co it nhat 1 chu hoa')
    .regex(/[0-9]/, 'Phai co it nhat 1 chu so')
    .regex(/[!@#$%^&*]/, 'Phai co it nhat 1 ky tu dac biet (!@#$%^&*)'),
})

const Register = () => {
  const navigate = useNavigate()
  const { register: registerUser } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    const result = await registerUser(data.email, data.password)
    setIsLoading(false)

    if (result.success) {
      toast.success('Tai khoan da tao! Vui long xac thuc email.')
      navigate('/login')
    } else {
      toast.error(result.error || 'Dang ky that bai')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Tao <span className="text-primary">Tai Khoan</span>
          </CardTitle>
          <CardDescription>Tham gia 24hStory ngay hom nay.</CardDescription>
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
                  placeholder="Tao mat khau manh"
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
                <div className="space-y-1">
                  {errors.password.message.split('. ').map((msg, i) => (
                    <p key={i} className="text-xs text-error">{msg}</p>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Dang tao tai khoan...' : 'Tao Tai Khoan'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-secondary">
            Da co tai khoan?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Dang nhap
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Register
