import styled, { css } from 'styled-components';
import {
  colorBlueLightest,
  colorGray,
  colorGrayLight,
  colorGrayLighter,
  colorPrimary,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';
import { $3xlPadding } from '/imports/ui/stylesheets/styled-components/general';

interface CornerProps {
  $roundedTop: boolean;
  $roundedBottom: boolean;
}

// The message box has 0.5rem corners inside a 1px border; the attachment sits
// flush in it, so it rounds the corners it shares with the box.
const INNER_RADIUS = 'calc(0.5rem - 1px)';
const corners = css<CornerProps>`
  border-radius: ${({ $roundedTop }) => ($roundedTop ? `${INNER_RADIUS} ${INNER_RADIUS}` : '0 0')}
    ${({ $roundedBottom }) => ($roundedBottom ? `${INNER_RADIUS} ${INNER_RADIUS}` : '0 0')};
`;

const ImageFrame = styled.button<CornerProps & { $ratio: number }>`
  ${corners}
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: ${({ $ratio }) => $ratio};
  padding: 0;
  border: none;
  overflow: hidden;
  background-color: ${colorBlueLightest};
  cursor: zoom-in;

  &:focus-visible {
    outline: 2px solid ${colorPrimary};
    outline-offset: -2px;
  }
`;

const Image = styled.img<{ $wide: boolean }>`
  display: block;
  ${({ $wide }) => ($wide
    ? 'width: 100%; height: auto; max-height: 100%;'
    : 'height: 100%; width: auto; max-width: 100%;')}
  /* An image with an alpha channel shows whatever is behind it, so dark artwork
     on a transparent background is nearly unreadable on a dark surface. The
     element only covers the image itself (never the bands), so an opaque light
     backdrop here never reads as a frame. The dark theme keeps --color-white
     at #FFFFFF, so the backdrop stays light there too. */
  background-color: ${colorWhite};
`;

const FileRow = styled.div<CornerProps>`
  ${corners}
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  padding: 0.375rem 0.5rem 0.375rem ${$3xlPadding};
  background-color: ${colorBlueLightest};
  color: ${colorGrayLight};
  font-size: ${fontSizeSmall};

  [dir='rtl'] & {
    padding: 0.375rem ${$3xlPadding} 0.375rem 0.5rem;
  }
`;

const FileIcon = styled.span`
  display: flex;
  flex-shrink: 0;
  color: ${colorPrimary};
  font-size: 1.5rem;
`;

const FileName = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileMeta = styled.span`
  flex-shrink: 0;
  white-space: nowrap;
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: ${colorGray};
  font-size: 1.25rem;
  cursor: pointer;

  &:hover {
    background-color: ${colorGrayLighter};
  }

  &:focus-visible {
    outline: 2px solid ${colorPrimary};
  }
`;

export default {
  ImageFrame,
  Image,
  FileRow,
  FileIcon,
  FileName,
  FileMeta,
  DownloadButton,
};
