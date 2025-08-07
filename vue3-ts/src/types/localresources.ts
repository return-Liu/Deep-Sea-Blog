export interface ResourceItem {
  id: string;
  name: string;
  image: string;
  size: number;
  date: Date;
}

export interface TreeNode {
  id: string;
  label: string;
  type: "year" | "month" | "week" | "file";
  count?: number;
  size?: number;
  children?: TreeNode[];
  image?: string;
  createdAt?: Date;
}
