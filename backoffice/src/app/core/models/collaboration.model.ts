export type CollaborationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Collaboration {
  id: number;
  phone: string;
  message: string;
  userEmail: string;
  userFullName: string;
  status: CollaborationStatus;
  attachments: string[];
  createdAt: string;
}

export interface CollaborationRequest {
  phone: string;
  message: string;
}
