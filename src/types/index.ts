export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  headerImage: string;
  authorId: string;
  author: Author;
  publishDate: string;
  scheduledDate?: string;
  tags: string[];
  featured: boolean;
  likes: number;
  commentCount: number;
  views: number;
  poll?: Poll;
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

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
  userVerified: boolean;
  content: string;
  parentId: string | null;
  likes: number;
  likedBy: string[];
  pinned: boolean;
  createdAt: string;
  replies?: Comment[];
}

export interface Poll {
  enabled: boolean;
  question: string;
  options: string[];
  expiration: string | null;
  locked: boolean;
  votes: Record<number, number>;
  totalVotes: number;
}

export interface PollVote {
  oderId: string;
  optionIndex: number;
  votedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "like" | "reply" | "follow" | "poll" | "verification" | "featured";
  message: string;
  read: boolean;
  createdAt: string;
  relatedId: string;
}
