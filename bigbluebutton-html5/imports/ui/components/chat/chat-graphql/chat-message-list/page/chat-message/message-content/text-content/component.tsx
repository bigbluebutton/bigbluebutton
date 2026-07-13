import React, {
  useMemo, useState, useCallback, useEffect,
} from 'react';
import Styled from './styles';
import { isJumbomoji } from './jumbomoji';
import Auth from '/imports/ui/services/auth';

// Uploaded images are served behind an auth_request that reads the sessionToken
// from the query string (same as presentation slides). The markdown stores the
// bare relative path, so we append the token at render time, mirroring
// Auth.authenticateURL used for slides. The regex only touches our own
// fileUpload paths; every other message is left untouched.
const FILE_UPLOAD_IMG_SRC = /(<img\b[^>]*?\bsrc=")(\/bigbluebutton\/fileUpload\/[^"]+)(")/g;

const authenticateUploadedImages = (html: string): string => html.replace(
  FILE_UPLOAD_IMG_SRC,
  (_match, prefix, url, suffix) => `${prefix}${Auth.authenticateURL(url)}${suffix}`,
);

export { authenticateUploadedImages };

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
        >
          <img src={lightboxSrc} alt="" />
        </Styled.ImageLightbox>
      )}
    </>
  );
};
export default ChatMessageTextContent;
