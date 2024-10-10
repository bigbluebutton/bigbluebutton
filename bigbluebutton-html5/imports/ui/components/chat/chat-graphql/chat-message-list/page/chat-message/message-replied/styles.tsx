import styled from 'styled-components';
import { colorOffWhite } from '/imports/ui/stylesheets/styled-components/palette';

const Container = styled.div<{ $userColor: string }>`
  border-radius: 4px;
  border-left: 4px solid ${({ $userColor }) => $userColor};
  background-color: ${colorOffWhite};
  padding: 6px;
  position: relative;
  margin: 0.25rem 0 0.25rem 0;
  overflow: hidden;
  cursor: pointer;
`;

const Typography = styled.div`
  overflow: hidden;
`;

const Username = styled(Typography)<{ $userColor: string }>`
  font-weight: bold;
  color: ${({ $userColor }) => $userColor};
  line-height: 1rem;
  font-size: 1rem;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Message = styled(Typography)`
  max-height: 3.6rem;
  line-height: 1.2rem;
  overflow: hidden;
`;

export default {
  Container,
  Username,
  Message,
};
