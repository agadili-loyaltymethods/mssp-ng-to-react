export interface Segment {
    name: string;
    description: string;
    type: string;
    org: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    ext?: {
        marketing?: boolean;
        useCase?: string;
    }
}