import styled from 'styled-components';
import { Select } from '@mui/material';
import {
  colorGrayDark, colorWhite,
} from '../../../stylesheets/styled-components/palette';
import { fontSizeSmall, textFontWeight } from '../../../stylesheets/styled-components/typography';
import {
  contentSidebarBorderRadius, contentSidebarPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';

const GuestManagement = styled(ScrollboxVertical)`
  padding: ${contentSidebarPadding} ${contentSidebarPadding} 
           ${contentSidebarPadding} ${contentSidebarPadding};
  border-radius: ${contentSidebarBorderRadius};
  background: ${colorWhite};
  overflow-y: auto;
  max-height: 50%;
`;

const GuestPolicyContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  flex-direction: column;
  width: 100%;
`;

const GuestPolicyText = styled.div`
  color: ${colorGrayDark};
  font-size: ${fontSizeSmall};
  font-weight: ${textFontWeight};
`;

const GuestPolicySelector = styled(Select)`
  height: 3.5rem;
  flex: 1;
  border-radius: 0.5rem !important;
  overflow: hidden;
  width: 100%;
`;

export default {
  GuestManagement,
  GuestPolicyContainer,
  GuestPolicyText,
  GuestPolicySelector,
};
