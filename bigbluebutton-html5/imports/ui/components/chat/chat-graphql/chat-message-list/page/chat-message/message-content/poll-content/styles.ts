import styled from 'styled-components';
import { colorText, colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';

export const PollText = styled.div<{ $collapsed: boolean }>`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  margin-left: 0.5rem;
  font-size: 1.25rem;
  font-weight: 500;
  color: ${colorText};
  word-break: break-word;

  ${({ $collapsed }) => $collapsed && `
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
  `}
`;

export const ExpandButton = styled.button`
  border: none;
  background: none;
  padding: 0;
  margin-left: 0.5rem;
  color: ${colorPrimary};
  cursor: pointer;
  text-decoration: underline;
`;

export const PollWrapper = styled.div`
  width: 100%;
`;

export const PollResult = styled.div`
  width: 100%;
`;

export default {
  PollText,
  PollWrapper,
  PollResult,
  ExpandButton,
};
