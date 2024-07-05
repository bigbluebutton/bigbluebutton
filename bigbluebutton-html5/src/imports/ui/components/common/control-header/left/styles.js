import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';

const HideButton = styled(Button)`
  padding: 0;
  margin: 0;
  line-height: normal;
  display: flex;
  align-items: center;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  & > i,
  & > i::before {
    width: auto;
    font-size: ${fontSizeBase} !important;

    [dir="rtl"] & {
      -webkit-transform: scale(-1, 1);
      -moz-transform: scale(-1, 1);
      -ms-transform: scale(-1, 1);
      -o-transform: scale(-1, 1);
      transform: scale(-1, 1);
    }
  }
`;

export default { HideButton };
