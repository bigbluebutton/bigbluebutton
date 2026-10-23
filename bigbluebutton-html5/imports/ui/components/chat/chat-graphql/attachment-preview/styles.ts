import styled from 'styled-components';
import { colorGrayLight, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmaller } from '/imports/ui/stylesheets/styled-components/typography';

interface InlineProps {
  $inline: boolean;
}

const Thumbnail = styled.img<InlineProps>`
  display: block;
  flex-shrink: 0;
  max-width: 6rem;
  max-height: ${({ $inline }) => ($inline ? '1rlh' : '3rem')};
  width: auto;
  height: auto;
  margin: ${({ $inline }) => ($inline ? '0' : '0.125rem 0')};
  border-radius: 4px;
  /* Same opaque backdrop as the image in the message, for transparent images
     on the dark theme. */
  background-color: ${colorWhite};
`;

const Label = styled.span`
  display: block;
  flex-shrink: 0;
  white-space: nowrap;
  color: ${colorGrayLight};
  font-size: ${fontSizeSmaller};
  line-height: normal;
`;

export default {
  Thumbnail,
  Label,
};
