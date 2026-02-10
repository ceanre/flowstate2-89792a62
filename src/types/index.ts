export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  headerImage: string;
  author: Author;
  publishDate: string;
  tags: string[];
  featured: boolean;
  likes: number;
  comments: number;
  views: number;
}

export interface Author {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  followers: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL: string;
  verified: boolean;
  followers: number;
  following: number;
  isAdmin: boolean;
  createdAt: string;
  lastUsernameChange: string | null;
}
