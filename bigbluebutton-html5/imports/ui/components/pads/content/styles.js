import styled from 'styled-components';
import {
  colorGray,
  colorGrayLightest
} from '/imports/ui/stylesheets/styled-components/palette';

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  position: relative;
  width: 100%;
`;

const contentText = `
font-family: Verdana, Arial, Helvetica, sans-serif;
font-size: 15px;
color: ${colorGray};
bottom: 0;
box-sizing: border-box;
display: flex;
flex-direction: column;
overflow-x: hidden;
overflow-wrap: break-word;
word-break: break-all;
overflow-y: auto;
padding-top: 1rem;
position: absolute;
width: 100%;
top: 0;


[dir="ltr"] & {
  padding-left: 1rem;
  padding-right: .5rem;
}

[dir="rtl"] & {
  padding-left: .5rem;
  padding-right: 1rem;
}
`;

const Iframe = styled.iframe`
  border-width: 0;
  width: 100%;
  border-top: 1px solid ${colorGrayLightest};
  border-bottom: 1px solid ${colorGrayLightest};
`;

export default {
  Wrapper,
  Iframe,
  contentText,
};
