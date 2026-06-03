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
  email: z.string().email('Email khong hop le'),
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
      toast.success('Email dat lai mat khau da duoc gui!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gui email that bai')
    }
    setIsLoading(false)
  }

  // Hiển thị trang xác nhận đã gửi email
  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Kiem Tra Email</CardTitle>
            <CardDescription>
              Neu tai khoan ton tai, chung toi da gui link dat lai mat khau.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link to="/login" className="text-primary hover:underline">
              Quay Lai Dang Nhap
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
          <CardTitle className="text-xl">Quen Mat Khau?</CardTitle>
          <CardDescription>
            Nhap email, chung toi se gui link dat lai mat khau.
          </CardDescription>
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Dang gui...' : 'Gui Link Dat Lai'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Link to="/login" className="text-sm text-secondary hover:text-primary">
            Quay Lai Dang Nhap
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ForgotPassword
