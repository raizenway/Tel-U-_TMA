export interface IconFile {
  id: number;
  originalName: string;
  altText: string | null;
  mimetype: string;
  encoding: string;
  path: string;
  destination: string | null;
  size: string; // atau number, sesuaikan dengan API
  aux: any;
  uploaderId: number | null;
  objectId: number | null;
  objectType: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransformationVariable {
  id: number;
  name: string;
  weight: string;
  description: string;
  reference: string;
  status: 'active' | 'inactive';
  iconFileId: number | null;        // ✅ tambahkan
  iconFile: IconFile | null;        // ✅ tambahkan
  createdAt: string;
  updatedAt: string;
  sortOrder: string;
}


export interface CreateTransformationVariableRequest {
  name: string;
  weight: string;
  description: string;
  reference: string;
  status: 'active' | 'inactive';
  iconFileId: number | null;        // ✅ tambahkan
  sortOrder: string;
}

export interface UpdateTransformationVariableRequest {
  name?: string;
  weight?: string;
  description?: string;
  reference?: string;
  status?: 'active' | 'inactive';
 iconFileId?: number | null;
  sortOrder?: string;
}

