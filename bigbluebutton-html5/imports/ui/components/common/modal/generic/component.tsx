import React, { useCallback, useEffect, useState } from 'react';
import { BBBModal } from '@bigbluebutton/bbb-ui-components-react';
import type { ModalPriority } from '/imports/ui/core/singletons/modalController';
import {
  createDocumentTitleViewId,
  registerDocumentTitleView,
  unregisterDocumentTitleView,
} from '/imports/ui/components/app/document-title-manager/service';

export type { ModalPriority };

export interface GenericModalProps {
  /** Id of the modal content element. */
  id?: string;
  /** Controls whether the modal is open. */
  isOpen: boolean;
  /** Callback when the modal requests to close (ESC key, overlay click, close button). */
  onRequestClose: () => void;
  /** Modal title displayed in the header. */
  title?: string;
  /** Accessibility label for the modal content region. Defaults to title. */
  contentLabel?: string;
  /** Shows dividers between header, body, and footer. */
  showDividers?: boolean;
  /** Allows closing the modal by clicking outside it. */
  shouldCloseOnOverlayClick?: boolean;
  /** Allows closing the modal with the ESC key. */
  shouldCloseOnEsc?: boolean;
  /** Enables vertical scrolling inside the modal body. */
  allowScroll?: boolean;
  /** Hides the footer section. Defaults to hiding it only when there is no `footerContent`. */
  noFooter?: boolean;
  /** Custom content rendered in the modal footer. */
  footerContent?: React.ReactNode;
  /** Keeps the footer pinned to the bottom when the body scrolls. */
  stickyFooter?: boolean;
  /** Modal body content. */
  children: React.ReactNode;
  /**
   * Controls z-index priority when multiple modals coexist.
   * Maps to the BBB portal class (`modal-low`, `modal-medium`, `modal-high`).
   */
  priority?: ModalPriority;
  /** Custom inline styles applied directly to the modal content element. */
  contentStyle?: React.CSSProperties;
  /** Test identifier propagated to the modal wrapper for automated testing. */
  'data-test'?: string;
  /**
   * Document title shown while the modal is open. `true` reuses `title`
   * (or `contentLabel`); a string is used as is.
   */
  documentTitle?: boolean | string;
  /**
   * When provided, positions the modal content directly below this element
   * (popover / anchored style). The dark backdrop is preserved.
   * Pass `null` to use the default centred layout (e.g. on mobile).
   */
  anchorElement?: HTMLElement | null;
}

/**
 * GenericModal — the single, unified modal primitive for BigBlueButton HTML5.
 *
 * Built on top of `BBBModal` from `@bigbluebutton/bbb-ui-components-react`, it adds
 * BBB-specific concerns (priority-based z-index, `data-test` attribute, document title) while
 * keeping the same clean API surface as the library component.
 *
 * Use this component for all new modals. Prefer migrating existing modals that
 * only need a title + body (and optionally a footer) away from `ModalSimple`.
 *
 * @example
 * <GenericModal
 *   title="Confirm Action"
 *   isOpen={isOpen}
 *   onRequestClose={handleClose}
 *   showDividers
 *   footerContent={<Button onClick={handleClose}>OK</Button>}
 * >
 *   <p>Are you sure you want to proceed?</p>
 * </GenericModal>
 */
const GenericModal: React.FC<GenericModalProps> = ({
  id,
  isOpen,
  onRequestClose,
  title,
  contentLabel,
  showDividers = false,
  shouldCloseOnOverlayClick = false,
  shouldCloseOnEsc = true,
  allowScroll = true,
  noFooter,
  footerContent = null,
  stickyFooter = true,
  children,
  priority,
  contentStyle,
  anchorElement,
  'data-test': dataTest,
  documentTitle = false,
}) => {
  const [documentTitleViewId] = useState(() => createDocumentTitleViewId('generic-modal'));
  const resolvedDocumentTitle = typeof documentTitle === 'string'
    ? documentTitle
    : (documentTitle && (title || contentLabel)) || null;

  useEffect(() => {
    if (isOpen && resolvedDocumentTitle) {
      registerDocumentTitleView(documentTitleViewId, resolvedDocumentTitle);
    } else {
      unregisterDocumentTitleView(documentTitleViewId);
    }
  }, [isOpen, resolvedDocumentTitle, documentTitleViewId]);

  useEffect(() => () => unregisterDocumentTitleView(documentTitleViewId), [documentTitleViewId]);

  // contentRef: applied directly to the ReactModal content element via the
  // BBBModal v2.1.0 API (ModalProps now extends ReactModal.Props).
  const contentRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    if (contentStyle) {
      Object.assign(node.style, contentStyle);
    }

    if (anchorElement) {
      // Position the modal content directly below the anchor element.
      // position:fixed removes the element from the overlay's flex flow so
      // align-items/justify-content no longer affect placement.
      const anchorRect = anchorElement.getBoundingClientRect();
      const anchorCenterX = anchorRect.left + anchorRect.width / 2;
      const marginX = 10;
      const viewportWidth = document.documentElement.clientWidth;
      // Constrain width so the modal never overflows the viewport (important on mobile).
      const effectiveWidth = Math.min(600, viewportWidth - 2 * marginX);
      // Center under the anchor, then clamp so neither edge escapes the viewport.
      const rawLeft = anchorCenterX - effectiveWidth / 2;
      const left = Math.max(marginX, Math.min(rawLeft, viewportWidth - effectiveWidth - marginX));
      Object.assign(node.style, {
        position: 'fixed',
        top: `${anchorRect.bottom + 10}px`,
        left: `${left}px`,
        width: `${effectiveWidth}px`,
        maxWidth: `${effectiveWidth}px`,
        overflow: 'visible',
      });
    }

    if (dataTest) {
      node.setAttribute('data-test', dataTest);
    }
  }, [anchorElement, contentStyle, dataTest]);

  return (
    <BBBModal
      id={id}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={title}
      contentLabel={contentLabel ?? title}
      showDividers={showDividers}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      shouldCloseOnEsc={shouldCloseOnEsc}
      allowScroll={allowScroll}
      noFooter={noFooter ?? !footerContent}
      footerContent={footerContent}
      stickyFooter={stickyFooter}
      contentRef={contentRefCallback}
      parentSelector={() => document.querySelector<HTMLElement>('#modals-container') ?? document.body}
      portalClassName={priority ? `modal-${priority}` : undefined}
    >
      {children}
    </BBBModal>
  );
};

export default GenericModal;
