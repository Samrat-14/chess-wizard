import { SoundType } from '@/types';

export const playSound = (type: SoundType) => {
  new Audio(`/assets/sounds/${type}.mp3`).play();
};

export const hideModal = (modalRef: React.RefObject<HTMLDivElement>): void => {
  modalRef.current?.classList.add('hidden');
};

export const unHideModal = (modalRef: React.RefObject<HTMLDivElement>): void => {
  modalRef.current?.classList.remove('hidden');
};
