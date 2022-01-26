import styled from 'styled-components';
import {
  colorGray,
  colorGrayLightest,
} from '/imports/ui/stylesheets/styled-components/palette';

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  position: relative;
  width: 100%;
`;

const Content = styled.div`
  font-family: Verdana, Arial, Helvetica, sans-serif;
  font-size: 1.15rem;
  color: ${colorGray};
  border-top: 1px solid ${colorGrayLightest};
  border-bottom: 1px solid ${colorGrayLightest};
  bottom: 0;
  box-sizing: border-box;
  display: flex;
  overflow-x: hidden;
  overflow-wrap: break-word;
  overflow-y: auto;
  padding-top: 1rem;
  position: absolute;
  width: 100%;
  top: 0;
  white-space: pre-wrap;

  [dir="ltr"] & {
    padding-left: 1rem;
    padding-right: .5rem;
  }

  [dir="rtl"] & {
    padding-left: .5rem;
    padding-right: 1rem;
  }
`;

export default {
  Wrapper,
  Content,
};
