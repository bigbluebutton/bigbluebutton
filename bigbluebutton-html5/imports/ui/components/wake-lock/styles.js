import styled from 'styled-components';
import {
  colorLink,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';

const ToastButtons = styled.div`
  display: inline;
`;

const Title = styled.h3`
  margin: 0;
`;

const AcceptButton = styled.button`
  align-self: center;
  &:focus {
    outline: none !important;
  }
  color: ${colorWhite} !important;
  background-color: ${colorLink} !important;
  margin: 0;
  border: none;
  padding: 0.3em 1em 0.3em 1em;
  margin-top: 1em;
  float: left;
`;

const CloseButton = styled.button`
  align-self: center;
  &:focus {
    outline: none !important;
  }
  margin: 0;
  border: none;
  padding: 0.3em 1em 0.3em 1em;
  margin-top: 1em;
  float: right;
`;

export default {
  ToastButtons,
  Title,
  AcceptButton,
  CloseButton,
};