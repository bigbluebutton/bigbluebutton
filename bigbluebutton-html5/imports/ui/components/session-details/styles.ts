import styled from 'styled-components';
import {
  colorGrayLightest,
  colorBlack,
} from '/imports/ui/stylesheets/styled-components/palette';
import deviceInfo from '/imports/utils/deviceInfo';
import Button from '/imports/ui/components/common/button/component';
import { smPadding } from '/imports/ui/stylesheets/styled-components/general';

const { isMobile } = deviceInfo;

const WelcomeMessage = styled.div`
  font-size: 1.0rem;
  margin-bottom: 1rem;
`;

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
  text-align: left;

  & > div {
    flex: 1 1 50%;
    box-sizing: border-box;
    padding: 10px;
  }

  & div p {
    margin: 0;
  }

  ${isMobile && `
    & div {
      flex: 1 1 100%;
    }
  `}

  ${!isMobile && `
    &::before {
      content: '';
      position: absolute;
      height: 50%;
      left: 50%;
      width: 1px;
      background-color: ${colorGrayLightest};
      transform: translateX(-50%);
    }
  `}
`;

const JoinTitle = styled.h2`
  font-size: 0.9rem;
  text-transform: uppercase;
  color: ${colorBlack};
  font-weight: 600;
`;

export const CopyButton = styled(Button)`
  [dir='ltr'] & {
    margin-left: ${smPadding};
  }

  [dir='rtl'] & {
    margin-right: ${smPadding};
  }
`;

export const Chevron = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid white;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
`;

export default {
  WelcomeMessage,
  Container,
  JoinTitle,
  CopyButton,
  Chevron,
};
