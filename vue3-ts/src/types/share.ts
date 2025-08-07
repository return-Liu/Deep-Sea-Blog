export interface Article {
  id: number;
  title: string;
  content: string;
  label: string;
  image: string;
  createdAt: string;
  isLiked: boolean;
  likesCount: number;
  views: number; // 添加浏览数量字段
  userId: number;
  type: string; // 添加类型字段
  isViewed: boolean; // 新增属性
}
export interface Photography {
  id: number;
  image: string;
  userId: number;
  createdAt: string;
  content: string;
  type: string; // 添加类型字段
}
export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  userId: number;
  image: string;
  type: string;
}
