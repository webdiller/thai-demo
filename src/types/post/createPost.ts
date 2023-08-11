import { Request } from "express";

export interface CreatePostRequest extends Request {
  body: CreatePostProps;
}

export interface CreatePostProps {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  postCategoryId: number;
  profileId: string;
}
