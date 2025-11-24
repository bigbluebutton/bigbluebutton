import styled from 'styled-components';
import {
  colorGrayLightest,
  colorGrayDark,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';
import { smPadding } from '/imports/ui/stylesheets/styled-components/general';

const WelcomeMessage = styled.div`
  font-size: 1.0rem;
  margin-bottom: 1rem;
`;

const Container = styled.div<{ isFullWidth: boolean }>`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
  text-align: left;

  & > div {
    flex: ${({ isFullWidth }) => (isFullWidth ? '1 1 100%' : '1 1 50%')};
    box-sizing: border-box;
    padding: 10px;
    overflow: auto;
    overflow-wrap: break-word;
  }

  & div p {
    margin: 0;
  }

  ${({ isFullWidth }) => !isFullWidth && `
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

  & a {
    color: ${colorPrimary};
    text-decoration: none;

    &:focus {
      color: ${colorPrimary};
      text-decoration: underline;
    }
    &:hover {
      filter: brightness(90%);
      text-decoration: underline;
    }
    &:active {
      filter: brightness(85%);
      text-decoration: underline;
    }
    &:hover:focus {
      filter: brightness(90%);
      text-decoration: underline;
    }
    &:focus:active {
      filter: brightness(85%);
      text-decoration: underline;
    }
  }
`;

const JoinTitle = styled.h2`
  font-size: 0.9rem;
  text-transform: uppercase;
  color: ${colorGrayDark};
  font-weight: 600;
`;

// @ts-ignore - as button comes from JS, we can't provide its props
export const CopyButton = styled(Button)`
  color: ${colorPrimary};
  
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
