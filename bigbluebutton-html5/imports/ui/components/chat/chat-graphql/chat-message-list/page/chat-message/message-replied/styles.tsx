import styled from 'styled-components';
import {
  colorDangerDark,
  colorGrayLight,
  colorGrayLightest, colorOffWhite, colorPrimary, colorText, colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import { $3xlPadding, smPadding } from '/imports/ui/stylesheets/styled-components/general';

const Container = styled.div`
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  background-color: ${colorWhite};
  box-shadow: inset 0 0 0 1px ${colorGrayLightest};
  padding: ${smPadding} ${$3xlPadding};
  position: relative;
  overflow: hidden;
  cursor: pointer;

  [dir='ltr'] & {
    border-right: 0.5rem solid ${colorPrimary};
  }

  [dir='rtl'] & {
    border-left: 0.5rem solid ${colorPrimary};
  }
`;

const Message = styled.div`
  line-height: normal;
  overflow: hidden;
`;

export const DeleteMessage = styled.span`
  color: ${colorGrayLight};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const HtmlContent = styled.div`
  color: ${colorText};

  & img {
    max-width: 100%;
    max-height: 100%;
  }

  & p {
    margin: 0;
    white-space: pre-wrap;
  }

  & pre:has(code), p code:not(pre > code) {
    background-color: ${colorOffWhite};
    border: solid 1px ${colorGrayLightest};
    border-radius: 4px;
    padding: 2px;
    margin: 0;
    font-size: 12px;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: anywhere;
  }
  & p code:not(pre > code) {
    color: ${colorDangerDark};
  }
  & h1 {
    font-size: 1.5em;
    margin: 0;
  }
  & h2 {
    font-size: 1.3em;
    margin: 0;
  }
  & h3 {
    font-size: 1.1em;
    margin: 0;
  }
  & h4 {
    margin: 0;
  }
  & h5 {
    margin: 0;
  }
  & h6 {
    margin: 0;
  }
`;

export default {
  Container,
  Message,
  DeleteMessage,
  HtmlContent,
};
