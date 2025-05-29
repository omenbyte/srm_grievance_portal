import { supabase } from './supabase'

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function uploadImage(file: File, userId: string): Promise<string> {
  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Only JPG and PNG files are allowed')
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 5MB')
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from('grievance-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Error uploading image:', error)
    throw new Error('Failed to upload image')
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('grievance-images')
    .getPublicUrl(fileName)

  return publicUrl
} 