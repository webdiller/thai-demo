export interface UpdateProfileRequest {
    id: string;
    contact: {
      phone?: string;
      email?: string;
      telegram?: string;
      whatsapp?: string;
    };
  }
  