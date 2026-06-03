import { useEffect, useState, useRef } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import useAuthStore from '@/stores/authStore'
import useStoryStore from '@/stores/storyStore'
import { Loader2, Upload, Trash2, Eye, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const MyStories = () => {
  const { user } = useAuthStore()
  const { myStories, fetchMyStories, createStory, deleteStory, isLoading } = useStoryStore()
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  // Load stories khi mount
  useEffect(() => {
    fetchMyStories()
  }, [fetchMyStories])

  // Chon file
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error('Vui long chon anh hoac video')
        return
      }
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  // Upload story
  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    const result = await createStory(selectedFile)
    setIsUploading(false)

    if (result.success) {
      toast.success('Da tao story!')
      setSelectedFile(null)
      setPreview(null)
      fetchMyStories()
    } else {
      toast.error(result.error || 'Tao story that bai')
    }
  }

  // Xoa story
  const handleDelete = async (storyId) => {
    if (!confirm('Xoa story nay?')) return

    const result = await deleteStory(storyId)
    if (result.success) {
      toast.success('Da xoa story')
    } else {
      toast.error(result.error || 'Xoa that bai')
    }
  }

  // Format ngay thang
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text">Story Cua Toi</h1>
            <p className="text-sm text-secondary">Tao va quan ly story</p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Upload size={18} className="mr-2" />
            Tao Story
          </Button>
        </div>

        {/* File input an */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,video/*"
          className="hidden"
        />

        {/* Preview popup */}
        {preview && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg border border-border max-w-md w-full p-4 animate-scale-in">
              <h3 className="text-lg font-medium text-text mb-4">Xem truoc</h3>
              <div className="aspect-[9/16] max-h-[400px] bg-surface rounded-lg overflow-hidden mb-4">
                {selectedFile?.type.startsWith('video') ? (
                  <video src={preview} controls className="w-full h-full object-contain" />
                ) : (
                  <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setSelectedFile(null)
                    setPreview(null)
                  }}
                >
                  Huy
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 size={18} className="animate-spin mr-2" />
                  ) : (
                    <Upload size={18} className="mr-2" />
                  )}
                  Tai Len
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : myStories.length === 0 ? (
          // Empty state
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <ImageIcon size={48} className="mx-auto text-muted mb-4" />
            <p className="text-secondary mb-2">Chua co story nao</p>
            <p className="text-sm text-muted mb-4">Tao story dau tien de chia se voi moi nguoi</p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload size={18} className="mr-2" />
              Tao Story
            </Button>
          </div>
        ) : (
          // Story grid
          <div className="grid grid-cols-3 gap-2">
            {myStories.map((story) => (
              <div
                key={story.id}
                className="relative aspect-[9/16] bg-surface rounded-lg overflow-hidden group"
              >
                <img
                  src={story.mediaUrl}
                  alt="Story"
                  className="w-full h-full object-cover"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 text-xs text-white">
                    <Eye size={12} />
                    <span>{story.viewCount || 0}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(story.id)}
                    className="p-1.5 bg-error/80 rounded-full text-white hover:bg-error transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="absolute top-2 right-2 text-xs text-white/70">
                  {formatDate(story.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default MyStories
