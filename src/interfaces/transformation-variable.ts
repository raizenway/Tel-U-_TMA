export interface TransformationVariable {
    id: number;
    name: string;
    weight: number;
    description: string;
    reference: string;
    status: 'active' | 'inactive'
    sortOrder: number;
}