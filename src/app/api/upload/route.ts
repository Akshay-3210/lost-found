import { NextRequest, NextResponse } from 'next/server';
import { cloudinary, isConfigured } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    if (!isConfigured) {
      console.error('Cloudinary not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file.');
      return NextResponse.json(
        { error: 'Cloudinary not configured. Please contact the administrator.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'lost-found-items',
      resource_type: 'image',
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    );
  }
}
