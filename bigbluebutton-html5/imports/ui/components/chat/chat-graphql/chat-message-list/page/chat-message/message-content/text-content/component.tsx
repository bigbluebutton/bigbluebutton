import React, {
  useMemo, useState, useCallback,
} from 'react';
import Auth from '/imports/ui/services/auth';
import Styled from './styles';
import { isJumbomoji } from './jumbomoji';
import ImageLightbox from '../image-lightbox/component';
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

  return (
    <>
      <Styled.ChatMessage
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: authenticateUploadedImages(text) }}
        data-test={dataTest}
        $jumbomoji={jumbomoji}
        onClick={handleClick}
        $currentUserId={Auth.userID as string | undefined}
      />
      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={closeLightbox} />}
    </>
  );
};
export default ChatMessageTextContent;
