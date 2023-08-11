import { Request } from "express";
import { UploadedFile } from "express-fileupload";

export type GetAllRequest = {
  includeSellerProfile?: boolean;
  includeSubcategories?: boolean;
};

export interface CategoryWithSubcategories {
  category: string;
  subcategories: string[];
}

export interface GetByQueryRequest extends GetAllRequest {
  whereCategoriesAndSubcategories: CategoryWithSubcategories[];
  whereCities: string[];
  page: number;
  take: number;
  orderBy: string | undefined;
}

export type UserDTOProps = {
  id: string;
  email: string;
  roles: UserRole[];
  isActivated: boolean;
};

export type UserRole = {
  id: number;
  name: string;
};

export interface RequestUser extends Request {
  user?: {
    id: string;
    roles: any;
    email: string;
    isActivated: boolean;
    iat: number;
    exp: number;
  };
}

export interface RequestUploadImage extends Request {
  file?: UploadedFile | UploadedFile[];
  orderNumber?: string;
  groupId?: string;
  serialNumber?: string;
  isUploaded?: string;
  user?: {
    id: string;
    roles: any;
    email: string;
    isActivated: boolean;
    iat: number;
    exp: number;
  };
}

export interface B2UploadResponse {
  data: {
    accountId: string;
    action: string;
    bucketId: string;
    contentLength: number;
    contentMd5: string;
    contentSha1: string;
    contentType: string;
    fileId: string;
    fileInfo: unknown;
    fileName: string;
    fileRetention: { isClientAuthorizedToRead: boolean; value: unknown };
    legalHold: { isClientAuthorizedToRead: boolean; value: unknown };
    serverSideEncryption: { algorithm: null; mode: null };
    uploadTimestamp: number;
  };
}

export interface YandexUploadResponse {
  ETag: string;
  Location: string;
  key: string;
  Key: string;
  Bucket: string;
}

export interface PreparedImage extends B2UploadResponse {}
