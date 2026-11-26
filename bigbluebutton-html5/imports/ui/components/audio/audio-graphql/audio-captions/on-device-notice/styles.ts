import styled, { keyframes } from 'styled-components';
import { colorDanger, colorText } from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';

const Notice = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  color: ${colorText};
  font-size: ${fontSizeSmall};
  font-weight: normal;
  white-space: normal;
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

// Chrome gives no download progress, so it pulses instead of showing a percentage
const Downloading = styled.span`
  animation: ${pulse} 1.5s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Error = styled.span`
  color: ${colorDanger};
`;

export default {
  Notice,
  Downloading,
  Error,
};
