DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Access billy-images" ON storage.objects;
    DROP POLICY IF EXISTS "Public Insert billy-images" ON storage.objects;
    DROP POLICY IF EXISTS "Public Update billy-images" ON storage.objects;
    DROP POLICY IF EXISTS "Public Delete billy-images" ON storage.objects;

    CREATE POLICY "Public Access billy-images" ON storage.objects FOR SELECT USING (bucket_id = 'billy-images');
    CREATE POLICY "Public Insert billy-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'billy-images');
    CREATE POLICY "Public Update billy-images" ON storage.objects FOR UPDATE USING (bucket_id = 'billy-images');
    CREATE POLICY "Public Delete billy-images" ON storage.objects FOR DELETE USING (bucket_id = 'billy-images');
END $$;
