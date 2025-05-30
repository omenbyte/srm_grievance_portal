import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'grievance-images'

export async function POST(req: Request) {
  try {
    const { file, userId } = await req.json()

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      )
    }

    // Convert base64 to blob
    const base64Data = file.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')
    const blob = new Blob([buffer])

    // Generate a unique filename
    const timestamp = Date.now()
    const filename = `${userId}_${timestamp}.jpg`

    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false
        })

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        
        // Check for specific error types
        if (uploadError.message === 'Bucket not found') {
          return NextResponse.json(
            { error: 'Storage bucket not configured. Please create a bucket named "grievance-images" in Supabase.' },
            { status: 500 }
          )
        }

        if (uploadError.message.includes('violates row-level security policy')) {
          return NextResponse.json(
            { error: 'Storage policy not configured. Please enable public uploads in Supabase storage policies.' },
            { status: 500 }
          )
        }

        if (uploadError.message.includes('Unauthorized')) {
          return NextResponse.json(
            { error: 'Unauthorized to upload. Please check storage policies.' },
            { status: 403 }
          )
        }

        return NextResponse.json(
          { error: 'Failed to upload image' },
          { status: 500 }
        )
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filename)

      if (!publicUrl) {
        throw new Error('Failed to get public URL')
      }

      return NextResponse.json({ url: publicUrl })
    } catch (storageError) {
      console.error('Storage error:', storageError)
      return NextResponse.json(
        { error: 'Failed to process image upload' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in upload-image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 