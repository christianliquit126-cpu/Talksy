const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadToCloudinary(file, folder = 'talksy') {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary is not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const isVideo = file.type.startsWith('video/');
  const resourceType = isVideo ? 'video' : 'image';
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload media to Cloudinary');
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
    format: data.format,
    width: data.width,
    height: data.height,
    duration: data.duration,
  };
}

export function getOptimizedImageUrl(url, { width = 400, quality = 'auto', format = 'auto' } = {}) {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/w_${width},q_${quality},f_${format}/`);
}

export function getVideoThumbnailUrl(url) {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/so_0,f_jpg/').replace(/\.(mp4|mov|avi|webm)$/, '.jpg');
}
