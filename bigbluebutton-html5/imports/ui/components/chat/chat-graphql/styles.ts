import styled from 'styled-components';
import {
  Separator as BaseSeparator,
} from '/imports/ui/components/sidebar-content/styles';
import { contentSidebarPadding, smPaddingX, smPaddingY } from '/imports/ui/stylesheets/styled-components/general';
import { CircularProgress } from '@mui/material';
import { colorPrimary, colorWhiteSurface } from '/imports/ui/stylesheets/styled-components/palette';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

interface ChatProps {
  isChrome: boolean;
  isRTL: boolean;
}

export const Chat = styled.div<ChatProps>`
  background-color: ${colorWhiteSurface};
  padding: ${smPaddingX};
  padding-bottom: ${smPaddingY};
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: space-around;
  overflow: hidden;
  height: 100%;
  user-select: none;

  ${({ isRTL }) => isRTL && `
    padding-left: 0.1rem;
  `}

  ${({ isRTL }) => !isRTL && `
    padding-right: 0.1rem;
  `}

  a {
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
  u {
    text-decoration-line: none;
  }

  ${({ isChrome }) => isChrome && `
    transform: translateZ(0);
  `}

  @media ${smallOnly} {
    transform: none !important;
  }
`;

const ChatMessages = styled.div`
  user-select: text;
`;

const Separator = styled(BaseSeparator)``;

const ButtonsWrapper = styled.div`
  display: flex;
  justifyContent: space-between;
`;

const LoadingWrapper = styled.div`
  justify-content: center;
  display: flex;
  flex-grow: 1;
`;

const CircularProgressContainer = styled(CircularProgress)`
  align-self: center;
`;

const ContentWrapper = styled.div`
  padding: ${contentSidebarPadding} ${contentSidebarPadding} 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: ${contentSidebarPadding};
  overflow: hidden;
`;

export default {
  ChatMessages,
  Separator,
  ButtonsWrapper,
  LoadingWrapper,
  CircularProgressContainer,
  ContentWrapper,
};
