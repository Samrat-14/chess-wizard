import { forwardRef, ReactNode, Ref } from 'react';

import '@/styles/modal.css';

type ModalProps = {
  type: 'popup-modal' | 'promotion-modal';
  hidden?: boolean;
  children: ReactNode;
};

export default forwardRef(function Modal({ type, hidden, children }: ModalProps, ref: Ref<HTMLDivElement>) {
  return (
    <div className={`modal-overlay ${hidden ? 'hidden' : ''}`} ref={ref}>
      <div className={type}>{children}</div>
    </div>
  );
});
