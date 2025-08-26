import styled from 'styled-components';

const Content = styled.div`
  padding: 0 1.5rem 1.5rem 1.5rem;

  #standard-basic-helper-text {
    margin-bottom: 0px;
  }
`;

const NoteContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

export default {
  Content,
  NoteContainer,
};
