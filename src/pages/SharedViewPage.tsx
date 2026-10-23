import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { sharedLinkApi, fileApi, storageApi } from '@/db/api';
import type { SharedLink, File } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatFileSize, getFileIcon, downloadBlob, isImageFile, isVideoFile } from '@/lib/fileUtils';
import { Download, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SharedViewPage() {
  const { token } = useParams<{ token: string }>();
  const [shareLink, setShareLink] = useState<SharedLink | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!token) return;

    const loadSharedContent = async () => {
      setLoading(true);
      try {
        let link: SharedLink | null = null;
        let fileData: File | null = null;
        let storageAccess = false;
        let accessRequiresPassword = false;

        try {
          link = await sharedLinkApi.getShareLink(token);
          if (link?.file_id) {
            fileData = await fileApi.getFile(link.file_id);
          }
        } catch (metadataError) {
          if (storageApi.getStorageProviderId() !== 's3') throw metadataError;
        }

        if ((!link || !fileData) && storageApi.getStorageProviderId() === 's3') {
          const access = await storageApi.getSharedFileInfo(token);
          link = {
            ...access.link,
            owner_id: '',
            folder_id: null,
            share_token: token,
            created_at: '',
            password: null,
            view_count: 0,
            download_count: 0,
            last_accessed_at: null,
          };
          fileData = {
            ...access.file,
            folder_id: null,
            owner_id: '',
            deleted_at: null,
            created_at: '',
            updated_at: '',
          };
          setRequiresPassword(access.requiresPassword);
          accessRequiresPassword = access.requiresPassword;
          storageAccess = true;
        }

        if (fileData?.storage_provider === 's3' && !storageAccess) {
          const access = await storageApi.getSharedFileInfo(token);
          link = {
            ...access.link,
            owner_id: '',
            folder_id: null,
            share_token: token,
            created_at: '',
            password: null,
            view_count: 0,
            download_count: 0,
            last_accessed_at: null,
          };
          fileData = {
            ...access.file,
            folder_id: null,
            owner_id: '',
            deleted_at: null,
            created_at: '',
            updated_at: '',
          };
          setRequiresPassword(access.requiresPassword);
          accessRequiresPassword = access.requiresPassword;
          storageAccess = true;
        }

        if (!link) {
          setError('Share link not found or has expired');
          return;
        }

        if (link.expires_at && new Date(link.expires_at) < new Date()) {
          setError('This share link has expired');
          return;
        }

        setShareLink(link);

        if (fileData && !fileData.is_deleted) {
          setFile(fileData);
          if (!accessRequiresPassword && link?.can_download &&
              (isImageFile(fileData.type) || isVideoFile(fileData.type) || fileData.type === 'application/pdf')) {
            const preview = storageAccess
              ? await storageApi.downloadSharedFile(fileData.storage_path, fileData.type, token)
              : await storageApi.downloadFile(fileData.storage_path, fileData.type, fileData.storage_provider);
            setPreviewBlob(preview);
          }
        } else if (link.file_id) {
          setError('File not found or has been deleted');
        }
      } catch (err) {
        setError('Failed to load shared content');
      } finally {
        setLoading(false);
      }
    };

    loadSharedContent();
  }, [token]);

  useEffect(() => {
    if (!previewBlob) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(previewBlob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [previewBlob]);

  const handleUnlock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !token || !password) return;

    setUnlocking(true);
    setPasswordError('');
    try {
      const blob = await storageApi.downloadSharedFile(file.storage_path, file.type, token, password);
      setPreviewBlob(blob);
      setRequiresPassword(false);
    } catch {
      setPasswordError('The password is incorrect or this shared file is unavailable.');
    } finally {
      setUnlocking(false);
    }
  };

  const handleDownload = async () => {
    if (!file || !shareLink?.can_download) return;
    if (requiresPassword) {
      setPasswordError('Enter the share password first.');
      return;
    }

    try {
      const blob = file.storage_provider === 's3' && token
        ? await storageApi.downloadSharedFile(file.storage_path, file.type, token, password)
        : await storageApi.downloadFile(file.storage_path, file.type, file.storage_provider);
      downloadBlob(blob, file.name);
      toast({
        title: 'Success',
        description: 'File downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  const renderPreview = () => {
    if (!file) return null;
    if (requiresPassword) {
      return (
        <form onSubmit={handleUnlock} className="mx-auto max-w-sm space-y-3 py-8">
          <label htmlFor="share-password" className="text-sm font-medium">This share is password protected</label>
          <Input
            id="share-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          <Button type="submit" disabled={unlocking}>
            {unlocking ? 'Checking…' : 'Unlock file'}
          </Button>
        </form>
      );
    }
    if (!shareLink?.can_download) {
      return <p className="py-8 text-center text-muted-foreground">The owner disabled access to this file.</p>;
    }

    if (isImageFile(file.type)) {
      if (!previewUrl) return <p className="py-8 text-center text-muted-foreground">Loading preview…</p>;
      return (
        <div className="flex items-center justify-center bg-muted rounded-lg p-4">
          <img
            src={previewUrl}
            alt={file.name}
            className="max-w-full max-h-[60vh] object-contain"
          />
        </div>
      );
    }

    if (isVideoFile(file.type)) {
      if (!previewUrl) return <p className="py-8 text-center text-muted-foreground">Loading preview…</p>;
      return (
        <div className="flex items-center justify-center bg-muted rounded-lg p-4">
          <video
            src={previewUrl}
            controls
            className="max-w-full max-h-[60vh]"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-4xl mb-4">
          {getFileIcon(file.type)}
        </div>
        <p className="text-muted-foreground mb-4">Preview not available for this file type</p>
        {shareLink?.can_download && (
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download to View
          </Button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">EpicBox</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto p-6">
          {file && (
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{file.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    Size: {formatFileSize(file.size)} • Type: {file.type}
                  </p>
                </div>
                {shareLink?.can_download && (
                  <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                )}
              </div>

              {renderPreview()}

              {!shareLink?.can_download && (
                <div className="mt-6 p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    Downloads are disabled for this shared file
                  </p>
                </div>
              )}
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
