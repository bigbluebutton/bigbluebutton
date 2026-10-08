import React, { useEffect, useLayoutEffect, useState } from 'react';
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
  /** Hides the header close button, for modals that must be answered through their own actions. */
  hideCloseButton?: boolean;
  /** Custom content rendered in the modal footer. */
  footerContent?: React.ReactNode;
  /** Keeps the footer pinned to the bottom when the body scrolls. */
  stickyFooter?: boolean;
  /** Modal body content. */
  children: React.ReactNode;
  /**
   * Controls z-index priority when multiple modals coexist.
   * Maps to the BBB portal class (`modal-low`, `modal-medium`, `modal-high`).
   * Defaults to `low`, like the legacy base modal.
   */
  priority?: ModalPriority;
  /** Custom inline styles applied directly to the modal content element. */
  contentStyle?: React.CSSProperties;
  /** Test identifier rendered as `data-testid` and the legacy `data-test` on the modal content element. */
  dataTest?: string;
  /** Test identifier of the close button. Defaults to `closeModal`, the id every legacy modal header used. */
  closeButtonDataTest?: string;
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
 * Positions the modal content directly below `anchorElement`, centred on it
 * and clamped to the viewport. `position: fixed` takes the content out of the
 * overlay's flex flow, so the overlay's centring no longer applies.
 */
const getAnchoredStyle = (anchorElement: HTMLElement): React.CSSProperties => {
  const anchorRect = anchorElement.getBoundingClientRect();
  const anchorCenterX = anchorRect.left + anchorRect.width / 2;
  const marginX = 10;
  const viewportWidth = document.documentElement.clientWidth;
  const effectiveWidth = Math.min(600, viewportWidth - 2 * marginX);
  const rawLeft = anchorCenterX - effectiveWidth / 2;
  const left = Math.max(marginX, Math.min(rawLeft, viewportWidth - effectiveWidth - marginX));

  return {
    position: 'fixed',
    top: `${anchorRect.bottom + 10}px`,
    left: `${left}px`,
    width: `${effectiveWidth}px`,
    maxWidth: `${effectiveWidth}px`,
    overflow: 'visible',
  };
};

/**
 * GenericModal — the single, unified modal primitive for BigBlueButton HTML5.
 *
 * Built on top of `BBBModal` from `@bigbluebutton/bbb-ui-components-react`, it adds
 * BBB-specific concerns (priority-based z-index, test ids, document title) while
 * keeping the same clean API surface as the library component.
 *
 * Use this component for all new modals. Prefer migrating existing modals that
 * only need a title + body (and optionally a footer) away from `ModalSimple`.
 *
 * Only the props declared in `GenericModalProps` reach the modal: `className`,
 * `styled(GenericModal)` rules and unknown props are dropped, so size or
 * position the content through `contentStyle`.
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
  hideCloseButton = false,
  footerContent = null,
  stickyFooter = true,
  children,
  priority,
  contentStyle,
  anchorElement,
  dataTest,
  closeButtonDataTest = 'closeModal',
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

  // The ReactModal content element (BBBModal forwards `contentRef`), styled
  // imperatively because BBBModal owns its inline `style`.
  const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null);
  // Serialized so an inline `contentStyle` literal does not re-apply every render.
  const contentStyleKey = contentStyle ? JSON.stringify(contentStyle) : '';

  useLayoutEffect(() => {
    if (!contentNode) return undefined;

    const { style } = contentNode;
    // Restoring the library's inline styles drops whatever a previous
    // anchor or contentStyle set before the current ones are applied.
    const baseCssText = style.cssText;
    const applyStyles = () => {
      style.cssText = baseCssText;
      Object.assign(style, contentStyle, anchorElement ? getAnchoredStyle(anchorElement) : undefined);
    };

    applyStyles();
    if (anchorElement) window.addEventListener('resize', applyStyles);

    return () => {
      window.removeEventListener('resize', applyStyles);
      style.cssText = baseCssText;
    };
  }, [contentNode, anchorElement, contentStyleKey]);

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
      hideCloseButton={hideCloseButton}
      footerContent={footerContent}
      stickyFooter={stickyFooter}
      contentRef={setContentNode}
      parentSelector={() => document.querySelector<HTMLElement>('#modals-container') ?? document.body}
      portalClassName={`modal-${priority ?? 'low'}`}
      testId={dataTest}
      data={dataTest ? { test: dataTest } : undefined}
      closeButtonDataTest={closeButtonDataTest}
    >
      {children}
    </BBBModal>
  );
};

export default GenericModal;
