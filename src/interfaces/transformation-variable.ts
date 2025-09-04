
export interface TransformationVariable {
  id: number;
  name: string;
  weight: number;
  description: string;
  reference: string;
  status: 'active' | 'inactive';
  sortOrder: number;
}


export interface CreateTransformationVariableRequest {
  name: string;
  weight: number;
  description: string;
  reference: string;
  status: 'active' | 'inactive';
  sortOrder: number;
}

export interface UpdateTransformationVariableRequest {
  name?: string;
  weight?: number;
  description?: string;
  reference?: string;
  status?: 'active' | 'inactive';
  sortOrder?: number;
}

