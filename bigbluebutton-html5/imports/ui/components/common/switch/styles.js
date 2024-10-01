import styled, { css } from 'styled-components';
import { borderSize } from '/imports/ui/stylesheets/styled-components/general';
import { colorDanger, colorSuccess } from '/imports/ui/stylesheets/styled-components/palette';

const Switch = styled.div`
  &:hover,
  &:focus,
  &:focus-within {
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
  }

  &:focus,
  &:focus-within {
    outline-style: solid;
  }

  display: inline-block;
  position: relative;
  cursor: pointer;
  background-color: transparent;
  border: 0;
  padding: 0;

  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  -webkit-tap-highlight-color: rgba(0,0,0,0);
  -webkit-tap-highlight-color: transparent;

  ${({ disabled }) => disabled && `
    cursor: not-allowed;
    opacity: 0.5;
  `}

  ${({ disabled, animations }) => disabled && animations && `
    transition: opacity 0.25s;
  `}
`;

const ToggleTrack = styled.div`
  overflow: hidden;
  width: 3.5rem;
  height: 1.5rem;
  padding: 0;
  border-radius: 2rem;
  background-color: ${colorDanger};

  [dir="rtl"] & {
    width: 4rem;
  }

  ${({ animations }) => animations && `
    transition: all 0.2s ease;
  `}

  ${({ checked }) => checked && `
    background-color: ${colorSuccess};
  `}

  ${({ invertColors, checked }) => invertColors && !checked && `
    background-color: ${colorSuccess} !important;
  `}

  ${({ invertColors, checked }) => invertColors && checked && `
    background-color: ${colorDanger} !important;
  `}

`;

const ToggleTrackCheck = styled.div`
  position: absolute;
  color: white;
  width: 1rem;
  line-height: 1.5rem;
  font-size: 0.8rem;
  left: 0.5rem;
  opacity: 0;

  [dir="rtl"] & {
    left: 0.8rem;
  }

  ${({ animations }) => animations && `
    transition: opacity 0.25s ease;
  `}

  ${({ checked }) => checked && `
    opacity: 1;
    transition: opacity calc(var(--enableAnimation) * 0.25s) ease;
  `}
`;

const ToggleTrackX = styled.div`
  position: absolute;
  color: white;
  width: 1rem;
  line-height: 1.5rem;
  font-size: 0.8rem;
  left: 1.7rem;
  opacity: 1;

  [dir="rtl"] & {
    left: 2.2rem;
  }

  ${({ animations }) => animations && `
    transition: opacity 0.25s ease;
  `}

  ${({ checked }) => checked && `
    opacity: 0;
  `}
`;

const ToggleThumb = styled.div`
  position: absolute;
  top: 1px;
  left: ${({ isRTL }) => isRTL ? '2.6rem' : '1px'};
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 50%;
  background-color: #FAFAFA;
  box-sizing: border-box;
  box-shadow: 2px 0px 10px -1px rgba(0,0,0,0.4);

  ${({ animations }) => animations && `
    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0ms;
  `}

  ${({ checked }) => checked && css`
    left: ${({ isRTL }) => isRTL ? '1px' : '2.1rem' };
    box-shadow: -2px 0px 10px -1px rgba(0,0,0,0.4);
  `}

  ${({ hasFocus }) => hasFocus && `
    box-shadow: 0px 0px 2px 3px #0F70D7;
  `}

  ${({ disabled }) => !disabled && `
    &:active{
      box-shadow: 0px 0px 5px 5px #0F70D7;
    }
  `}
`;

const ScreenreaderInput = styled.input`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
`;

export default {
  Switch,
  ToggleTrack,
  ToggleTrackCheck,
  ToggleTrackX,
  ToggleThumb,
  ScreenreaderInput,
};
