import React, {
  useMemo, useState, useCallback, useEffect,
} from 'react';
import Styled from './styles';
import { isJumbomoji } from './jumbomoji';
import { authenticateUploadedImages } from '/imports/ui/components/chat/chat-graphql/service';

interface ChatMessageTextContentProps {
  text: string;
  dataTest?: string | null;
}
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
      if (src.includes('/bigbluebutton/fileUpload/')) {
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
      {lightboxSrc && (
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
        </Styled.ImageLightbox>
      )}
    </>
  );
};
export default ChatMessageTextContent;
