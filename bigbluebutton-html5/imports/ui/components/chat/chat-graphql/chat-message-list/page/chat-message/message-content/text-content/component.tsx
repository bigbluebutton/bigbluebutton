import React, {
  useMemo, useState, useCallback, useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import Styled from './styles';
import { isJumbomoji } from './jumbomoji';
import { authenticateUploadedImages } from '/imports/ui/components/chat/chat-graphql/service';

interface ChatMessageTextContentProps {
  text: string;
  dataTest?: string | null;
}

// img.src is an absolute URL, so a substring check would also match
// https://evil.example/bigbluebutton/fileUpload/...; require the same origin
// plus the upload path prefix instead.
const isUploadedImageSrc = (src: string): boolean => {
  try {
    const url = new URL(src, window.location.href);
    return url.origin === window.location.origin
      && url.pathname.startsWith('/bigbluebutton/fileUpload/');
  } catch {
    return false;
  }
};
const ChatMessageTextContent: React.FC<ChatMessageTextContentProps> = ({
  text,
  dataTest = 'messageContent',
}) => {
  const jumbomoji = useMemo(() => isJumbomoji(text), [text]);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const { src } = target as HTMLImageElement;
      if (isUploadedImageSrc(src)) {
        e.preventDefault();
        setLightboxSrc(src);
      }
    }
  }, []);

  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

  useEffect(() => {
    if (!lightboxSrc) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightboxSrc, closeLightbox]);

  return (
    <>
      <Styled.ChatMessage
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: authenticateUploadedImages(text) }}
        data-test={dataTest}
        $jumbomoji={jumbomoji}
        onClick={handleClick}
      />
      {/* The lightbox is a position:fixed full-viewport overlay, but it is
          rendered deep inside the chat message list, whose panel wrapper carries
          a `transform` (from the sliding-panel animation). Any transform makes an
          ancestor the containing block for position:fixed descendants, so the
          overlay would be positioned/clipped to the narrow, overflow:hidden chat
          panel instead of the viewport (black sliver, image clipped out of view).
          Portal it to document.body so it escapes that containing block, matching
          how other BBB overlays (e.g. polling) render. */}
      {lightboxSrc && createPortal(
        <Styled.ImageLightbox
          onClick={closeLightbox}
          data-test="imageLightbox"
          role="dialog"
          aria-modal="true"
        >
          {/* tabIndex lets keyboard users land on the enlarged image (and its
              Escape-to-close), since the lightbox has no other focusable child */}
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
          <img src={lightboxSrc} alt="" tabIndex={0} />
        </Styled.ImageLightbox>,
        document.body,
      )}
    </>
  );
};
export default ChatMessageTextContent;
