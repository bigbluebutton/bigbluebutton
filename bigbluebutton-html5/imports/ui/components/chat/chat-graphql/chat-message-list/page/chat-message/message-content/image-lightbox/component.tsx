import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Styled from './styles';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, alt = '', onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // The lightbox is a position:fixed full-viewport overlay, but it is
  // rendered deep inside the chat message list, whose panel wrapper carries
  // a `transform` (from the sliding-panel animation). Any transform makes an
  // ancestor the containing block for position:fixed descendants, so the
  // overlay would be positioned/clipped to the narrow, overflow:hidden chat
  // panel instead of the viewport (black sliver, image clipped out of view).
  // Portal it to document.body so it escapes that containing block, matching
  // how other BBB overlays (e.g. polling) render.
  return createPortal(
    <Styled.ImageLightbox
      onClick={onClose}
      data-test="imageLightbox"
      role="dialog"
      aria-modal="true"
    >
      {/* tabIndex lets keyboard users land on the enlarged image (and its
          Escape-to-close), since the lightbox has no other focusable child */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <img src={src} alt={alt} tabIndex={0} />
    </Styled.ImageLightbox>,
    document.body,
  );
};

export default ImageLightbox;
