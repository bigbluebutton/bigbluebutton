import styled from 'styled-components';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { smPaddingX } from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeLarger } from '/imports/ui/stylesheets/styled-components/typography';

const Placeholder = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px ${colorWhite} dashed;
  justify-content: center;
  align-items: center;
  color: ${colorWhite};
  overflow: hidden;

  & > span {
    margin: ${smPaddingX};
    font-size: ${fontSizeLarger};
    text-align: center;
  }
`;

export default {
  Placeholder,
};
