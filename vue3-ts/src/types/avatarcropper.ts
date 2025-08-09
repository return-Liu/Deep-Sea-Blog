export interface Props {
  title?: string;
  previewTitle?: string;
  selectImageText?: string;
  zoomInText?: string;
  zoomOutText?: string;
  rotateLeftText?: string;
  rotateRightText?: string;
  confirmText?: string;
  apiUrl?: string;
  userId?: string;
}
export interface CropperInstance {
  getCropData: (callback: (data: string) => void) => void;
  changeScale: (num: number) => void;
  rotateLeft: () => void;
  rotateRight: () => void;
}
