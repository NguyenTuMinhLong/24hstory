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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain 1 uppercase letter')
    .regex(/[0-9]/, 'Must contain 1 number')
    .regex(/[!@#$%^&*]/, 'Must contain 1 special character'),
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different',
  path: ['newPassword'],
})

const Profile = () => {
  const navigate = useNavigate()
  const { user, updateAvatar, changePassword, logout, logoutAll, logoutAllDevices } = useAuthStore()
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

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image')
      return
    }

    const result = await updateAvatar(file)
    if (result.success) {
      toast.success('Avatar updated!')
    } else {
      toast.error(result.error || 'Failed to update avatar')
    }
  }

  const onPasswordSubmit = async (data) => {
    setIsChangingPassword(true)
    const result = await changePassword(data.currentPassword, data.newPassword)
    setIsChangingPassword(false)

    if (result.success) {
      toast.success('Password changed!')
      reset()
      setShowPasswordForm(false)
    } else {
      toast.error(result.error || 'Failed to change password')
    }
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out!')
    navigate('/login')
  }

  const handleLogoutAll = async () => {
    if (!confirm('Logout from all devices?')) return
    const result = await logoutAll()
    if (result.success) {
      toast.success('Logged out from all devices!')
      navigate('/login')
    } else {
      toast.error(result.error)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
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
              Member since {formatDate(user.createdAt)}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            <Key size={18} className="mr-3" />
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </Button>

          {showPasswordForm && (
            <form
              onSubmit={handleSubmit(onPasswordSubmit)}
              className="space-y-3 p-4 bg-card rounded-lg border border-border animate-slide-up"
            >
              <div className="space-y-2">
                <label className="text-sm text-secondary">Current Password</label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  {...register('currentPassword')}
                  className={errors.currentPassword ? 'border-error' : ''}
                />
                {errors.currentPassword && (
                  <p className="text-xs text-error">{errors.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-secondary">New Password</label>
                <Input
                  type="password"
                  placeholder="Enter new password"
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
                Update Password
              </Button>
            </form>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start text-error hover:text-error hover:bg-error/10"
            onClick={handleLogoutAll}
          >
            <LogOut size={18} className="mr-3" />
            Logout All Devices
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-secondary hover:text-error"
            onClick={handleLogout}
          >
            <X size={18} className="mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </Layout>
  )
}

export default Profile
