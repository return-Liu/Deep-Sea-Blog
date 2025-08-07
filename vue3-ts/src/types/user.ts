export interface User {
  id: number;
  avatar: string;
  nickname: string;
  area: string;
  birthday: Date;
  constellation: string;
  introduce: string;
  uuid: string;
  nicknameColor: string;
}
export interface ContentItem {
  id: number;
  title: string;
  image: string;
  createdAt: string;
  views: number;
  content?: string;
  userId: number;
  label?: string;
}
