import styled from 'styled-components';
import { colorOffWhite } from '/imports/ui/stylesheets/styled-components/palette';

const Container = styled.div<{ $userColor: string }>`
  border-radius: 4px;
  border-left: 4px solid ${({ $userColor }) => $userColor};
  background-color: ${colorOffWhite};
  padding: 6px;
  position: relative;
  margin: 0.25rem 0 0.25rem 2.6rem;
  overflow: hidden;
  cursor: pointer;
`;

const Typography = styled.div`
  line-height: 1rem;
  font-size: 1rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Username = styled(Typography)<{ $userColor: string }>`
  font-weight: bold;
  color: ${({ $userColor }) => $userColor};
  margin-bottom: 6px;
`;

const Message = styled(Typography)``;

export default {
  Container,
  Username,
  Message,
};
