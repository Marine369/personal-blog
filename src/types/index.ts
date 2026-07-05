export interface PostWithAuthor {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  published: boolean;
  tags: string | null;
  authorId: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  _count: {
    comments: number;
    likes: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PostWithDetails extends PostWithAuthor {
  comments: CommentWithAuthor[];
  likes: LikeWithUser[];
}

export interface CommentWithAuthor {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  createdAt: string;
}

export interface LikeWithUser {
  id: string;
  postId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
