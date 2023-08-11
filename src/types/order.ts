import { UploadedFile } from "express-fileupload";

export type CreateOneProps = {
  title: string;
  content: string;
  cityId: number;
  price: number;
  categoryId: string;
  subcategoryId: string;
  sellerProfileId: string;
  contact: {
    phone?: string;
    email?: string;
    telegram?: string;
    whatsapp?: string;
  };
};

export type UpdateOneProps = {
  orderNumber: number;
  title: string;
  content: string;
  cityId: number;
  price: number;
  sellerProfileId: string;
  contact: {
    phone?: string;
    email?: string;
    telegram?: string;
    whatsapp?: string;
  };
};

export type ArhivateOneProps = {
  orderNumber: number;
  isArhivated: boolean;
  sellerProfileId: string;
};

export type UploadImageProps = {
  orderNumber: string;
  groupId: string;
  image: UploadedFile;
  userId: string;
  serialNumber: string;
  isUploaded: string;
};

export interface GetPathsByCategoryReq extends Request {
  categorySlug?: string;
};
