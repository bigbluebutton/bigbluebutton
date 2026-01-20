import styled from 'styled-components';
import {
  mdPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import { colorDanger, colorGray, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import CommonHeader from '/imports/ui/components/common/control-header/component';

const Notes = styled.div<{ isChrome: boolean }>`
  background-color: ${colorWhite};
  padding: ${mdPaddingX} 0 0 ${mdPaddingX};
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  height: 100%;

  ${({ isChrome }) => isChrome && `
    transform: translateZ(0);
  `}

  @media ${smallOnly} {
    transform: none !important;
    &.no-padding {
      padding: 0;
    }
  }
`;

const Header = styled(CommonHeader)`
  padding-bottom: .2rem;
`;

const WarningNotificationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
  flex-grow: 1;
`;

const ErrorMessage = styled.p`
  color: ${colorDanger};
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const WaringMessage = styled.p`
  color: ${colorGray};
  font-size: 1rem;
  margin-bottom: 1rem;
`;

export default {
  Notes,
  Header,
  WarningNotificationContainer,
  ErrorMessage,
  WaringMessage,
};
