import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import {
  borderSize,
  borderRadius,
  dropdownCaretHeight,
  dropdownCaretWidth,
} from '/imports/ui/stylesheets/styled-components/general';
import { colorWhite, colorGray } from '/imports/ui/stylesheets/styled-components/palette';
import { lineHeightComputed } from '/imports/ui/stylesheets/styled-components/typography';

const Content = styled.div`
  outline: transparent;
  outline-width: ${borderSize};
  outline-style: solid;
  z-index: 9999;
  position: absolute;
  background: ${colorWhite};
  border-radius: ${borderRadius};
  box-shadow: 0 6px 12px rgba(0, 0, 0, .175);
  border: 0;
  padding: calc(${lineHeightComputed} / 2);

  [dir="rtl"] & {
    right: 10.75rem;
  }

  &:after,
  &:before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
  }

  &[aria-expanded="false"] {
    display: none;
  }

  &[aria-expanded="true"] {
    display: block;
  }

  @media ${smallOnly} {
    z-index: 1015;
    border-radius: 0;
    background-color: #fff;
    box-shadow: none;
    position: fixed;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    border: 0 !important;
    padding: 0 !important;
    margin: 0 0 calc(${lineHeightComputed} * 5.25) 0 !important;
    transform: translateX(0) translateY(0) !important;

    &:after,
    &:before {
      display: none !important;
    }
  }

  //top-left
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: calc(${dropdownCaretHeight} * 1.25);

  &:before,
  &:after {
    border-left: ${dropdownCaretWidth} solid transparent;
    border-right: ${dropdownCaretWidth} solid transparent;
    border-top: ${dropdownCaretHeight} solid ${colorWhite};
    bottom: 0;
    margin-bottom: calc(${dropdownCaretHeight} * -1);
  }

  &:before {
    border-top: ${dropdownCaretHeight} solid ${colorGray};
  }

  transform: translateX(100%);
  right: 100%;
  left: auto;

  &:after,
  &:before {
    left: ${dropdownCaretWidth};
  }

  min-width: 18rem;

  @media ${smallOnly} {
    width: auto;
  }

  [dir="rtl"] {
    transform: translateX(25%);
  }
`;

const Scrollable = styled.div`
  @media ${smallOnly} {
    overflow-y: auto;
    background: linear-gradient(white 30%, rgba(255,255,255,0)),
      linear-gradient(rgba(255,255,255,0), white 70%) 0 100%,
      /* Shadows */
      radial-gradient(farthest-side at 50% 0, rgba(0,0,0,.2), rgba(0,0,0,0)),
      radial-gradient(farthest-side at 50% 100%, rgba(0,0,0,.2), rgba(0,0,0,0)) 0 100%;

    background-repeat: no-repeat;
    background-color: transparent;
    background-size: 100% 40px, 100% 40px, 100% 14px, 100% 14px;
    background-attachment: local, local, scroll, scroll;

    // Fancy scroll
    &::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    &::-webkit-scrollbar-button {
      width: 0;
      height: 0;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,.25);
      border: none;
      border-radius: 50px;
    }
    &::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,.5); }
    &::-webkit-scrollbar-thumb:active { background: rgba(0,0,0,.25); }
    &::-webkit-scrollbar-track {
      background: rgba(0,0,0,.25);
      border: none;
      border-radius: 50px;
    }
    &::-webkit-scrollbar-track:hover { background: rgba(0,0,0,.25); }
    &::-webkit-scrollbar-track:active { background: rgba(0,0,0,.25); }
    &::-webkit-scrollbar-corner { background: 0 0; }

    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
`;

export default {
  Content,
  Scrollable,
};
