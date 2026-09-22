import React from 'react';
import type { ModalPriority } from '/imports/ui/components/common/modal/generic/component';

export interface ModalSimpleProps {
  id?: string;
  title?: string;
  contentLabel?: string;
  dismiss?: { callback?: (() => void) | null };
  shouldCloseOnOverlayClick?: boolean;
  shouldCloseOnEsc?: boolean;
  modalIsOpen?: boolean;
  isOpen?: boolean;
  onRequestClose?: (() => void) | null;
  priority?: ModalPriority | string;
  dataTest?: string;
  documentTitle?: boolean | string;
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
  anchorElement?: Element | null;
  /** Extra props forwarded to GenericModal */
  [key: string]: unknown;
}

declare const ModalSimple: React.FC<ModalSimpleProps>;
export default ModalSimple;
