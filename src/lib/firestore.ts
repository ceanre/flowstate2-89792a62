import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  onSnapshot,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Article, UserProfile, Comment, PollVote } from "@/types";

// ─── Users ───────────────────────────────────────────────

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (e) {
    console.error("getUserProfile error:", e);
    return null;
  }
};

export const createUserProfile = async (profile: UserProfile) => {
  try {
    await setDoc(doc(db, "users", profile.uid), profile);
  } catch (e) {
    console.error("createUserProfile error:", e);
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  try {
    await updateDoc(doc(db, "users", uid), data);
  } catch (e) {
    console.error("updateUserProfile error:", e);
  }
};

export const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  try {
    const q = query(collection(db, "users"), where("username", "==", username.toLowerCase()));
    const snap = await getDocs(q);
    return snap.empty;
  } catch (e) {
    console.error("checkUsername error:", e);
    return true;
  }
};

export const getUserByUsername = async (username: string): Promise<UserProfile | null> => {
  try {
    const q = query(collection(db, "users"), where("username", "==", username.toLowerCase()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as UserProfile;
  } catch (e) {
    console.error("getUserByUsername error:", e);
    return null;
  }
};

export const getUserByEmail = async (email: string): Promise<UserProfile | null> => {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as UserProfile;
  } catch (e) {
    console.error("getUserByEmail error:", e);
    return null;
  }
};

// ─── Articles ────────────────────────────────────────────

export const getArticles = async (): Promise<Article[]> => {
  try {
    const q = query(collection(db, "articles"), orderBy("publishDate", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Article));
  } catch (e) {
    console.error("getArticles error:", e);
    return [];
  }
};

export const getArticleBySlug = async (slug: string): Promise<Article | null> => {
  try {
    const q = query(collection(db, "articles"), where("slug", "==", slug));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Article;
  } catch (e) {
    console.error("getArticleBySlug error:", e);
    return null;
  }
};

export const createArticle = async (article: Omit<Article, "id">) => {
  try {
    const ref = await addDoc(collection(db, "articles"), article);
    return ref.id;
  } catch (e) {
    console.error("createArticle error:", e);
    return null;
  }
};

export const updateArticle = async (id: string, data: Partial<Article>) => {
  try {
    await updateDoc(doc(db, "articles", id), data);
  } catch (e) {
    console.error("updateArticle error:", e);
  }
};

export const deleteArticle = async (id: string) => {
  try {
    await deleteDoc(doc(db, "articles", id));
  } catch (e) {
    console.error("deleteArticle error:", e);
  }
};

// ─── Comments ────────────────────────────────────────────

export const getComments = async (articleId: string): Promise<Comment[]> => {
  try {
    const q = query(
      collection(db, "comments"),
      where("articleId", "==", articleId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment));
  } catch (e) {
    console.error("getComments error:", e);
    return [];
  }
};

export const addComment = async (comment: Omit<Comment, "id">) => {
  try {
    const ref = await addDoc(collection(db, "comments"), comment);
    return ref.id;
  } catch (e) {
    console.error("addComment error:", e);
    return null;
  }
};

export const likeComment = async (commentId: string, userId: string, unlike = false) => {
  try {
    const ref = doc(db, "comments", commentId);
    if (unlike) {
      await updateDoc(ref, { likes: increment(-1), likedBy: arrayRemove(userId) });
    } else {
      await updateDoc(ref, { likes: increment(1), likedBy: arrayUnion(userId) });
    }
  } catch (e) {
    console.error("likeComment error:", e);
  }
};

export const pinComment = async (commentId: string, pinned: boolean) => {
  try {
    await updateDoc(doc(db, "comments", commentId), { pinned });
  } catch (e) {
    console.error("pinComment error:", e);
  }
};

// ─── Polls ───────────────────────────────────────────────

export const votePoll = async (articleId: string, userId: string, optionIndex: number) => {
  try {
    const voteId = `${articleId}_${userId}`;
    await setDoc(doc(db, "poll_votes", voteId), {
      oderId: userId,
      articleId,
      optionIndex,
      votedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("votePoll error:", e);
  }
};

export const getUserPollVote = async (articleId: string, userId: string): Promise<PollVote | null> => {
  try {
    const voteId = `${articleId}_${userId}`;
    const snap = await getDoc(doc(db, "poll_votes", voteId));
    return snap.exists() ? (snap.data() as PollVote) : null;
  } catch (e) {
    console.error("getUserPollVote error:", e);
    return null;
  }
};

export const getPollResults = async (articleId: string): Promise<Record<number, number>> => {
  try {
    const q = query(collection(db, "poll_votes"), where("articleId", "==", articleId));
    const snap = await getDocs(q);
    const results: Record<number, number> = {};
    snap.docs.forEach((d) => {
      const idx = d.data().optionIndex;
      results[idx] = (results[idx] || 0) + 1;
    });
    return results;
  } catch (e) {
    console.error("getPollResults error:", e);
    return {};
  }
};

// ─── Followers ───────────────────────────────────────────

export const followUser = async (followerId: string, followingId: string) => {
  try {
    const id = `${followerId}_${followingId}`;
    await setDoc(doc(db, "followers", id), { followerId, followingId, createdAt: new Date().toISOString() });
    await updateDoc(doc(db, "users", followingId), { followers: increment(1) });
    await updateDoc(doc(db, "users", followerId), { following: increment(1) });
  } catch (e) {
    console.error("followUser error:", e);
  }
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  try {
    const id = `${followerId}_${followingId}`;
    await deleteDoc(doc(db, "followers", id));
    await updateDoc(doc(db, "users", followingId), { followers: increment(-1) });
    await updateDoc(doc(db, "users", followerId), { following: increment(-1) });
  } catch (e) {
    console.error("unfollowUser error:", e);
  }
};

export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    const id = `${followerId}_${followingId}`;
    const snap = await getDoc(doc(db, "followers", id));
    return snap.exists();
  } catch (e) {
    return false;
  }
};

// ─── Admin ───────────────────────────────────────────────

export const setUserVerified = async (uid: string, verified: boolean) => {
  await updateUserProfile(uid, { verified });
};

export const setUserAdmin = async (uid: string, isAdmin: boolean) => {
  await updateUserProfile(uid, { isAdmin });
};

export const setFollowerCount = async (uid: string, count: number) => {
  await updateUserProfile(uid, { followers: count });
};
