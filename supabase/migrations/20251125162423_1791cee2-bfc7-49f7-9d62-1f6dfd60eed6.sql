-- Make lesson content buckets public so enrolled students can access videos and PDFs
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('lesson-videos', 'lesson-pdfs');