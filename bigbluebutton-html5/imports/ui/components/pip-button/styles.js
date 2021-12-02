import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';

const PipButton = styled(Button)`
  display: flex;
  padding: 5px;
  &,
  &:active,
  &:hover,
  &:focus {
    border: none !important;
    background-color: var(--color-transparent) !important;
    svg {
      border: none !important;
      background-color: var(--color-transparent) !important;
    }
  }
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const Wrapper = styled.div`
  position: absolute;
  right: 2rem;
  left: auto;
  background-color: var(--color-transparent);
  cursor: pointer;
  border: 0;
  z-index: 2;
  margin: 2px;
  [dir="rtl"] & {
    right: auto;
    left: 2rem;
  }
  ${({ dark }) => dark && `
    background-color: rgba(0, 0, 0, .3);
    & .button path:nth-child(2) {
      fill: var(--color-white);
    }
  `}
  ${({ light }) => light && `
    background-color: var(--color-transparent);
    & .button path:nth-child(2) {
      fill: var(--color-black);
    }
  `}
  ${({ bottom }) => bottom && `
    bottom: 0;
  `}
  ${({ top }) => top && `
    top: 0;
  `}
  ${({ right }) => right && `
    right: 0;
    [dir="rtl"] & {
      right: auto;
      left: 0;
    }
  `}
`;

export default {
  PipButton,
  Wrapper,
};
