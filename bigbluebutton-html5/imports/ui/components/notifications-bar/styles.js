import styled from 'styled-components';
import { lineHeightComputed } from '/imports/ui/stylesheets/styled-components/typography';
import {
  colorGray,
  colorWhite,
  colorPrimary,
  colorSuccess,
  colorDanger,
} from '/imports/ui/stylesheets/styled-components/palette';

const NotificationsBar = styled.div`
  padding: calc(${lineHeightComputed} / 2);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-weight: 600;

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

const RetryButton = styled.button`
  background-color: transparent;
   border: none;
   cursor: pointer;
   text-decoration: underline;
   display: inline;
   margin: 0;
   padding: 0;
   color: ${colorWhite};
`;

export default {
  NotificationsBar,
  RetryButton,
};
