export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  username: string;
  role: UserRole;
  storage_used: number;
  storage_limit: number;
  created_at: string;
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  storage_path: string;
  storage_provider: 'supabase' | 's3';
  is_favorite: boolean;
  folder_id: string | null;
  owner_id: string;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SharedLink {
  id: string;
  file_id: string | null;
  folder_id: string | null;
  owner_id: string;
  share_token: string;
  can_download: boolean;
  expires_at: string | null;
  created_at: string;
  password: string | null;
  view_count: number;
  download_count: number;
  last_accessed_at: string | null;
}

export interface ShareAccessLog {
  id: string;
  share_id: string;
  access_type: 'view' | 'download';
  accessed_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface FileWithOwner extends File {
  owner?: {
    username: string;
  };
}

export interface FolderWithOwner extends Folder {
  owner?: {
    username: string;
  };
}

export type ViewMode = 'grid' | 'list';

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export type SortField = 'name' | 'created_at' | 'size' | 'type';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
  label: string;
}

export interface FileAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}
