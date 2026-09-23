export interface Quote {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  productName: string | null;
  message: string;
  attachments: string[];
  createdAt: string;
}
