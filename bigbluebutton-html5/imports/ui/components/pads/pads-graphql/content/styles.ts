import styled from 'styled-components';
import {
  colorBorder,
  colorGrayLight,
  colorWhiteSurface,
} from '/imports/ui/stylesheets/styled-components/palette';
import { lgBorderRadius } from '/imports/ui/stylesheets/styled-components/general';

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  position: relative;
  width: 100%;
`;

const contentText = `
  font-family: Verdana, Arial, Helvetica, sans-serif;
  font-size: 15px;
  background-color: ${colorWhiteSurface};
  color: ${colorGrayLight};
  bottom: 0;
  box-sizing: border-box;
  display: block;
  overflow-x: hidden;
  overflow-wrap: break-word;
  overflow-y: auto;
  padding-top: 1rem;
  position: absolute;
  right: 0;
  left:0;
  top: 0;
  white-space: normal;


  [dir="ltr"] & {
    padding-left: 1rem;
    padding-right: .5rem;
  }

  [dir="rtl"] & {
    padding-left: .5rem;
    padding-right: 1rem;
  }
`;

const Iframe = styled.iframe<{isOnMediaArea: boolean}>`
  border-width: 0;
  width: 100%;
  border-top: 1px solid ${colorBorder};
  border-bottom: 1px solid ${colorBorder};
  border-radius: ${({ isOnMediaArea }) => (isOnMediaArea ? lgBorderRadius : `0 0 ${lgBorderRadius}`)};
`;

export default {
  Wrapper,
  Iframe,
  contentText,
};
