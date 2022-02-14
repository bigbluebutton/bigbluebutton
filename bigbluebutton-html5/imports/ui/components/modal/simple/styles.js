import styled from 'styled-components';
import Styled from '../base/styles';
import Button from '/imports/ui/components/common/button/component';
import { borderSize } from '/imports/ui/stylesheets/styled-components/general';
import {
  lineHeightComputed,
  fontSizeLarge,
} from '/imports/ui/stylesheets/styled-components/typography';
import {
  colorWhite,
  colorGrayLighter,
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';

const SimpleModal = styled(Styled.BaseModal)`
  outline: transparent;
  outline-width: ${borderSize};
  outline-style: solid;
  display: flex;
  flex-direction: column;
  padding: calc(${lineHeightComputed} / 2) ${lineHeightComputed};
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.5);
  background-color: ${colorWhite} !important;
`;

const Header = styled.header`
  display: flex;
  flex-shrink: 0;

  ${({ hideBorder }) => !hideBorder && `
    padding: calc(${lineHeightComputed} / 2) 0;
    border-bottom: ${borderSize} solid ${colorGrayLighter};
  `}
`;

const Title = styled.h1`
  min-width: 0;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin: 0;
  font-weight: 400;
  font-size: ${fontSizeLarge};
  text-align: center;
  align-self: flex-end;

  ${({ hasLeftMargin }) => hasLeftMargin && `
    margin-left: 35px;
  `}
`;

const DismissButton = styled(Button)`
  flex: 0;
  & > span:first-child {
    border-color: transparent;
    background-color: transparent;

    & > i { color: ${colorText}; }
  }
`;

const Content = styled.div`
  overflow: visible;
  color: ${colorText};
  font-weight: normal;
  padding: 0;
`;

export default {
  SimpleModal,
  Header,
  Title,
  DismissButton,
  Content,
};
