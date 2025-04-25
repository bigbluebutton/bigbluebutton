import styled from 'styled-components';
import {
  Separator as BaseSeparator,
} from '/imports/ui/components/sidebar-content/styles';
import { contentSidebarPadding } from '/imports/ui/stylesheets/styled-components/general';
import { CircularProgress } from '@mui/material';

const ChatMessages = styled.div`
  user-select: text;
`;

const Separator = styled(BaseSeparator)``;

const ButtonsWrapper = styled.div`
  display: flex;
  justifyContent: space-between;
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
  CircularProgressContainer,
  ContentWrapper,
};
