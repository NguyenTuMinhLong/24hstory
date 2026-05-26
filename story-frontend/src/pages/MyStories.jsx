import { useEffect, useState, useRef } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
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

  useEffect(() => {
    fetchMyStories()
  }, [fetchMyStories])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error('Please select an image or video')
        return
      }
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    const result = await createStory(selectedFile)
    setIsUploading(false)

    if (result.success) {
      toast.success('Story created!')
      setSelectedFile(null)
      setPreview(null)
      fetchMyStories()
    } else {
      toast.error(result.error || 'Failed to create story')
    }
  }

  const handleDelete = async (storyId) => {
    if (!confirm('Delete this story?')) return

    const result = await deleteStory(storyId)
    if (result.success) {
      toast.success('Story deleted')
    } else {
      toast.error(result.error || 'Failed to delete story')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text">My Stories</h1>
            <p className="text-sm text-secondary">Create and manage your stories</p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Upload size={18} className="mr-2" />
            Create Story
          </Button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,video/*"
          className="hidden"
        />

        {preview && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg border border-border max-w-md w-full p-4 animate-scale-in">
              <h3 className="text-lg font-medium text-text mb-4">Preview</h3>
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
                  Cancel
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
                  Upload
                </Button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : myStories.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <ImageIcon size={48} className="mx-auto text-muted mb-4" />
            <p className="text-secondary mb-2">No stories yet</p>
            <p className="text-sm text-muted mb-4">Create your first story to share with others</p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload size={18} className="mr-2" />
              Create Story
            </Button>
          </div>
        ) : (
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
