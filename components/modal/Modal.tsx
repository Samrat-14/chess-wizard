import { forwardRef, ReactNode, Ref } from 'react';

import './modal.css';

type ModalProps = {
  type: 'popup-modal' | 'promotion-modal';
  hidden?: boolean;
  children: ReactNode;
};

const Modal = forwardRef(({ type, hidden, children }: ModalProps, ref: Ref<HTMLDivElement>) => {
  return (
    <div className={`modal-overlay ${hidden ? 'hidden' : ''}`} ref={ref}>
      <div className={type}>{children}</div>
    </div>
  );
});

export default Modal;
