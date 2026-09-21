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
  /** Legacy props — accepted and ignored */
  shouldShowCloseButton?: boolean;
  hideBorder?: boolean;
  headerPosition?: string;
  width?: string | number;
  height?: string | number;
  padding?: string | number;
  anchorElement?: Element | null;
  setIsOpen?: (open: boolean) => void;
  /** Extra props forwarded to GenericModal */
  [key: string]: unknown;
}

declare const ModalSimple: React.FC<ModalSimpleProps>;
export default ModalSimple;
