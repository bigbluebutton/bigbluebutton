import styled, { keyframes } from 'styled-components';

const colorGray = '#4E5A66';

const LoadingSpinnerAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoadingSpinnerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10%;
  height: 100%;
`;

const LoadingSpinner = styled.div`
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 1.7rem;
  height: 1.7rem;
  border: 3px solid ${colorGray};
  border-radius: 2rem;
  animation: ${LoadingSpinnerAnimation} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: ${colorGray} transparent transparent transparent;
  cursor: not-allowed;

  &:nth-child(1) {
    animation-delay: -0.45s;
  }

  &:nth-child(2) {
    animation-delay: -0.3s;
  }

  &:nth-child(3) {
    animation-delay: -0.15s;
  }
`;

export {
  LoadingSpinner, LoadingSpinnerWrapper,
};
