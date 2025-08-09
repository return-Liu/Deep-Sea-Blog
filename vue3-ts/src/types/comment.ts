export interface Comment {
  id: number;
  username: string;
  useravatar: string;
  content: string;
  createdAt: Date;
  likesCount: string;
  area: string;
  userId: string;
  commentbackground: string;
  nicknameColor: string;
  uuid: string;
  articleId: string;
  noteId: string;
  photographyId: string;
  replies?: Comment[]; // 添加这一行，表示可选的回复列表
}