import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase credentials not configured");
  }
  return createClient(url, key);
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: Buffer | Blob,
  contentType?: string
): Promise<string> {
  const supabase = getSupabase();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: contentType || "application/octet-stream",
    upsert: true,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return getPublicUrl(bucket, path);
}

export async function uploadBase64(
  bucket: string,
  path: string,
  base64Data: string,
  contentType = "image/png"
): Promise<string> {
  const buffer = Buffer.from(base64Data, "base64");
  return uploadFile(bucket, path, buffer, contentType);
}

export function getPublicUrl(bucket: string, path: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL not set");
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}
