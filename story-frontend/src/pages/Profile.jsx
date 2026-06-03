import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Camera, LogOut, Key, Check, X } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import useAuthStore from '@/stores/authStore'
import toast from 'react-hot-toast'

// Validate change password form
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mat khau hien tai khong duoc trong'),
  newPassword: z
    .string()
    .min(8, 'Mat khau it nhat 8 ky tu')
    .regex(/[A-Z]/, 'Phai co it nhat 1 chu hoa')
    .regex(/[0-9]/, 'Phai co it nhat 1 chu so')
    .regex(/[!@#$%^&*]/, 'Phai co it nhat 1 ky tu dac biet'),
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'Mat khau moi phai khac mat khau cu',
  path: ['newPassword'],
})

const Profile = () => {
  const navigate = useNavigate()
  const { user, updateAvatar, changePassword, logout, logoutAll } = useAuthStore()
  const fileInputRef = useRef(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  })

  // Upload avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui long chon mot anh')
      return
    }

    const result = await updateAvatar(file)
    if (result.success) {
      toast.success('Da cap nhat avatar!')
    } else {
      toast.error(result.error || 'Cap nhat avatar that bai')
    }
  }

  // Submit doi mat khau
  const onPasswordSubmit = async (data) => {
    setIsChangingPassword(true)
    const result = await changePassword(data.currentPassword, data.newPassword)
    setIsChangingPassword(false)

    if (result.success) {
      toast.success('Da doi mat khau!')
      reset()
      setShowPasswordForm(false)
    } else {
      toast.error(result.error || 'Doi mat khau that bai')
    }
  }

  // Dang xuat
  const handleLogout = async () => {
    await logout()
    toast.success('Da dang xuat!')
    navigate('/login')
  }

  // Dang xuat tat ca thiet bi
  const handleLogoutAll = async () => {
    if (!confirm('Dang xuat khoi tat ca thiet bi?')) return
    const result = await logoutAll()
    if (result.success) {
      toast.success('Da dang xuat khoi tat ca thiet bi!')
      navigate('/login')
    } else {
      toast.error(result.error)
    }
  }

  // Format ngay thanh thanh
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        {/* Profile header */}
        <div className="text-center py-8">
          <div className="relative inline-block">
            <Avatar src={user?.avatar} alt={user?.email} size="xl" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-primary text-background rounded-full hover:bg-primary-hover transition-colors"
            >
              <Camera size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-text">
            {user?.email?.split('@')[0]}
          </h1>
          <p className="text-sm text-secondary">{user?.email}</p>
          {user?.createdAt && (
            <p className="text-xs text-muted mt-1">
              Tham gia tu ngay {formatDate(user.createdAt)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Doi mat khau */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            <Key size={18} className="mr-3" />
            {showPasswordForm ? 'Huy' : 'Doi Mat Khau'}
          </Button>

          {showPasswordForm && (
            <form
              onSubmit={handleSubmit(onPasswordSubmit)}
              className="space-y-3 p-4 bg-card rounded-lg border border-border animate-slide-up"
            >
              <div className="space-y-2">
                <label className="text-sm text-secondary">Mat Khau Hien Tai</label>
                <Input
                  type="password"
                  placeholder="Nhap mat khau hien tai"
                  {...register('currentPassword')}
                  className={errors.currentPassword ? 'border-error' : ''}
                />
                {errors.currentPassword && (
                  <p className="text-xs text-error">{errors.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-secondary">Mat Khau Moi</label>
                <Input
                  type="password"
                  placeholder="Nhap mat khau moi"
                  {...register('newPassword')}
                  className={errors.newPassword ? 'border-error' : ''}
                />
                {errors.newPassword && (
                  <p className="text-xs text-error">{errors.newPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isChangingPassword}>
                {isChangingPassword ? (
                  <Loader2 size={18} className="animate-spin mr-2" />
                ) : (
                  <Check size={18} className="mr-2" />
                )}
                Cap Nhat Mat Khau
              </Button>
            </form>
          )}

          {/* Dang xuat tat ca thiet bi */}
          <Button
            variant="ghost"
            className="w-full justify-start text-error hover:text-error hover:bg-error/10"
            onClick={handleLogoutAll}
          >
            <LogOut size={18} className="mr-3" />
            Dang Xuat Tat Ca Thiet Bi
          </Button>

          {/* Dang xuat */}
          <Button
            variant="ghost"
            className="w-full justify-start text-secondary hover:text-error"
            onClick={handleLogout}
          >
            <X size={18} className="mr-3" />
            Dang Xuat
          </Button>
        </div>
      </div>
    </Layout>
  )
}

export default Profile
