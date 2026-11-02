import React from 'react';
import type { GenericModalProps, ModalPriority } from '/imports/ui/components/common/modal/generic/component';

/** GenericModal props ModalSimple forwards unchanged. */
type ForwardedModalProps = Partial<Omit<GenericModalProps, 'isOpen' | 'onRequestClose' | 'children' | 'priority'>>;

export interface ModalSimpleProps extends ForwardedModalProps {
  dismiss?: { callback?: (() => void) | null };
  modalIsOpen?: boolean;
  isOpen?: boolean;
  onRequestClose?: (() => void) | null;
  priority?: ModalPriority | string;
  children?: React.ReactNode;
  /** Closes the modal (via `setIsOpen(false)`) on a `CLOSE_MODAL_<NAME>` document event. */
  modalName?: string;
  setIsOpen?: (open: boolean) => void;
  /** Legacy props — accepted and ignored */
  shouldShowCloseButton?: boolean;
  hideBorder?: boolean;
  headerPosition?: string;
  width?: string | number;
  height?: string | number;
  padding?: string | number;
}

declare const ModalSimple: React.FC<ModalSimpleProps>;
export default ModalSimple;
