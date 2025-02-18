import supabase from "../config/supabase"

/**
 * Uploads an image to Supabase Storage and returns the public URL.
 * @param fileBuffer - The file's data as a Buffer.
 * @param fileName - The desired name for the file (including folder path if necessary).
 * @param bucketName - The name of the Supabase Storage bucket. Default is 'volunteer-images'.
 * @returns A promise that resolves to the public URL of the uploaded image.
 */
export async function uploadImageToSupabase(
    fileBuffer: Buffer,
    fileName: string,
    bucketName: string = 'images'
): Promise<string> {
    try {
        // Upload the file to Supabase
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, fileBuffer);

        if (error) {
            throw new Error(`Supabase upload failed: ${error.message}`);
        }

        // Retrieve the public URL
        const { data: { publicUrl: publicURL } } = supabase.storage.from(bucketName).getPublicUrl(fileName);

        if (!publicURL) {
            throw new Error('Failed to retrieve public URL.');
        }

        return publicURL;
    } catch (err) {
        console.error('Error uploading image to Supabase:', err);
        throw err;
    }
}
