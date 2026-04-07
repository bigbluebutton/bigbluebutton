import styled, { keyframes } from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
`;

const Content = styled.div`
  text-align: center;
  color: white;
  font-size: 24px;
  max-width: 650px;
  padding: 0 20px;
`;

const Heading = styled.h1`
  font-size: 2rem;
  font-weight: bold;
`;

const Position = styled.div`
  align-items: center;
  text-align: center;
  font-size: 0.9em;
  font-weight: normal;
  opacity: 0.85;
  margin-bottom: 24px;
`;

const MessageContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.35);
  padding: 20px 28px;
  border-radius: 12px;
  margin: 8px 0 24px 0;
`;

const MessageLabel = styled.div`
  font-size: 0.75em;
  font-weight: normal;
  opacity: 0.7;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MessageText = styled.p`
  font-size: 1em;
  font-weight: 500;
  line-height: 1.4;
  margin: 0;
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
`;

const WaitingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.8em;
  font-weight: normal;
  opacity: 0.7;
  margin-top: 8px;
`;

const WaitingDot = styled.span`
  width: 8px;
  height: 8px;
  background-color: #4ade80;
  border-radius: 50%;
  display: inline-block;
  animation: ${pulse} 2s ease-in-out infinite;
`;

// Keep old spinner components for backwards compatibility but they won't be used
const sk_bouncedelay = keyframes`
  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1.0);
  }
`;

const Spinner = styled.div`
  margin: 20px auto;
  font-size: 0px;
`;

const Bounce = styled.div`
  width: 18px;
  height: 18px;
  margin: 0 5px;
  background-color: rgb(255, 255, 255);
  display: inline-block;
  border-radius: 100%;
  animation: ${sk_bouncedelay} calc(1.4s) infinite ease-in-out both;
`;

const Bounce1 = styled(Bounce)`
  animation-delay: -0.32s;
`;

const Bounce2 = styled(Bounce)`
  animation-delay: -0.16s;
`;

export default {
  Container,
  Content,
  Heading,
  Position,
  MessageContainer,
  MessageLabel,
  MessageText,
  WaitingIndicator,
  WaitingDot,
  Bounce,
  Bounce1,
  Bounce2,
  Spinner,
};
