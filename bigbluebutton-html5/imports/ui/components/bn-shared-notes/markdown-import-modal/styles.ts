import styled from 'styled-components';
import { colorGrayLighter, colorDanger } from '/imports/ui/stylesheets/styled-components/palette';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 20rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 12rem;
  resize: vertical;
  padding: 0.5rem;
  border: 1px solid ${colorGrayLighter};
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875rem;
`;

const Warning = styled.p`
  margin: 0;
  color: ${colorDanger};
  font-weight: 600;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

export default {
  Container,
  Textarea,
  Warning,
  Actions,
};
