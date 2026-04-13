export type Creator = {
  id: number;
  name: string;
  email: string;
  profileImageUrl: string;
};

export type Resource = {
  id: number;
  title: string;
  description: string;
  resourceLink: string;
  views: number;
  likes: number;
  downloads: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  creator: Creator;
};

export type ResourcesResponse = {
  data: Resource[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

export type AddResourcePayload = {
  title: string;
  description: string;
  resourceLink: string;
};

export type AddResourceResponse = {
  success: string;
  resource: {
    id: number;
    title: string;
    description: string;
    resourceLink: string;
    createdBy: number;
    views: number;
    likes: number;
    downloads: number;
    updatedAt: string;
    createdAt: string;
  };
};

export type editResourcePayload = {
  title: string;
  description: string;
  resourceLink: string;
  views?: number;
  likes?: number;
  downloads?: number;
};
