import styled from 'styled-components';
import { lineHeightComputed } from '/imports/ui/stylesheets/styled-components/typography';
import {
  colorGray,
  colorWhite,
  colorPrimary,
  colorSuccess,
  colorDanger,
} from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';

const NotificationsBar = styled.div`
  padding: calc(${lineHeightComputed} / 2) 0;
  gap: .5rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  ${({ isMobile }) => isMobile && `
    font-size: .75rem;`}

  ${({ color }) => color === 'default' && `
    color: ${colorGray};
    background-color: ${colorWhite};
    border-color: ${colorWhite};
  `}

  ${({ color }) => color === 'primary' && `
    color: ${colorWhite};
    background-color: ${colorPrimary};
    border-color: ${colorPrimary};
  `}
  
  ${({ color }) => color === 'success' && `
    color: ${colorWhite};
    background-color: ${colorSuccess};
    border-color: ${colorSuccess};
  `}

  ${({ color }) => color === 'danger' && `
    color: ${colorWhite};
    background-color: ${colorDanger};
    border-color: ${colorDanger};
  `}
`;

const ReloadButton = styled(Button)`
  border: 1px solid ${colorWhite} !important;
`;

export default {
  NotificationsBar,
  ReloadButton,
};
