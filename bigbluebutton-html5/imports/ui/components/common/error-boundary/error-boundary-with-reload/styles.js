import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const ErrorContainer = styled.div`
  padding: 40px;
  text-align: center;
  background-color: #0d1b2a;
  color: #ffffff;
  border-radius: 8px;
  margin: 20px auto;
  max-width: 600px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
  font-family: 'Arial', sans-serif;
`;

export const Message = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
`;

export const Spinner = styled.div`
  margin: 0 auto;
  border: 4px solid rgba(255, 255, 255, 0.2);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #00bfff;
  animation: ${spin} 1s linear infinite;
`;

export const ReloadButton = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  background-color: #00bfff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  text-transform: uppercase;
`;
