import { useCallback, useState } from 'react';
import { getUrl, list, uploadData } from 'aws-amplify/storage';

export function useUploads() {
  const [docFile, setDocFile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loadingUploads, setLoadingUploads] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  const refreshUploads = useCallback(async () => {
    try {
      setLoadingUploads(true);
      const { items } = await list({
        path: ({ identityId }) => `uploads/${identityId}/`,
        options: { pageSize: 50 },
      });
      setUploads(items ?? []);
    } catch (error) {
      console.warn('refreshUploads failed:', error);
      setUploads([]);
    } finally {
      setLoadingUploads(false);
    }
  }, []);

  const uploadDocument = useCallback(
    async ({ user, profileId, firstName, lastName }) => {
      if (!docFile || uploading) return;
      setUploading(true);
      setUploadPct(0);
      try {
        const { result } = await uploadData({
          path: ({ identityId }) => `uploads/${identityId}/${Date.now()}_${docFile.name}`,
          data: docFile,
          options: {
            contentType: docFile.type || 'application/octet-stream',
            metadata: {
              userSub: (user?.attributes?.sub ?? '').toString(),
              email: (
                user?.attributes?.email ??
                user?.signInDetails?.loginId ??
                user?.username ??
                ''
              ).toString(),
              profileId: (profileId ?? '').toString(),
              profileName: `${firstName || ''} ${lastName || ''}`.trim(),
            },
            onProgress: ({ transferredBytes, totalBytes }) => {
              if (!totalBytes) return;
              const pct = Math.round((transferredBytes / totalBytes) * 100);
              setUploadPct(pct);
            },
          },
        });
        await result;
        setDocFile(null);
        setUploadPct(100);
        await refreshUploads();
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed. Please try again.');
      } finally {
        setUploading(false);
        setTimeout(() => setUploadPct(0), 1200);
      }
    },
    [docFile, refreshUploads, uploading]
  );

  const openUpload = useCallback(async (path) => {
    try {
      const { url } = await getUrl({ path, options: { expiresIn: 300 } });
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('getUrl failed:', error);
      alert('Could not open file.');
    }
  }, []);

  const resetUploads = useCallback(() => {
    setDocFile(null);
    setUploads([]);
    setUploading(false);
    setUploadPct(0);
  }, []);

  return {
    docFile,
    setDocFile,
    uploads,
    loadingUploads,
    uploading,
    uploadPct,
    refreshUploads,
    uploadDocument,
    openUpload,
    resetUploads,
  };
}
