export const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Calculate new dimensions while maintaining aspect ratio
        const aspectRatio = width / height
        
        if (aspectRatio > 1) {
          // Image is wider than tall
          width = Math.min(width, maxWidth)
          height = width / aspectRatio
        } else {
          // Image is taller than wide or square
          height = Math.min(height, maxHeight)
          width = height * aspectRatio
        }
        
        // Ensure both dimensions don't exceed maximums
        if (width > maxWidth) {
          width = maxWidth
          height = width / aspectRatio
        }
        if (height > maxHeight) {
          height = maxHeight
          width = height * aspectRatio
        }
        
        // Round dimensions to integers
        width = Math.round(width)
        height = Math.round(height)
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        // Draw image with white background for transparency
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, width, height)
        
        // Use better image smoothing
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to blob with higher quality for smaller images
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'))
              return
            }
            
            // Create new file from blob
            const resizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            
            resolve(resizedFile)
          },
          'image/jpeg',
          0.92 // Slightly higher quality for smaller images
        )
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
  })
} 