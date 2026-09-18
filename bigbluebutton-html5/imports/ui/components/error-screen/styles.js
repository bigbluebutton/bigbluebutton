import styled from 'styled-components';
import {
  colorWhite,
  colorGrayDark,
  colorGrayLighter,
} from '/imports/ui/stylesheets/styled-components/palette';

const Background = styled.div`
  position: fixed;
  display: flex;
  flex-flow: column;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: ${colorGrayDark};
  color: ${colorWhite};
  text-align: center;
`;

const Message = styled.h1`
  margin: 0;
  color: ${colorWhite};
  font-size: 1.75rem;
  font-weight: 400;
  margin-bottom: 1rem;
`;

const SessionMessage = styled.div`
  /* Constrained so a full sentence wraps into a readable column instead of one edge-to-edge line. */
  max-width: 40rem;
  margin: 0 auto 1rem;
  padding: 0 1rem;
  color: ${colorWhite};
  font-weight: 400;
  font-size: 1.25rem;
`;

const Separator = styled.div`
  height: 0;
  width: 5rem;
  border: 1px solid ${colorGrayLighter};
  margin: 1.5rem 0 1.5rem 0;
  align-self: center;
  opacity: .75;
`;

/* Not a heading: it carries a bare number, which is meaningless in a heading-navigation pass and
   would compete with the real headline as a second <h1>. Weight is set explicitly to keep the
   appearance an h1 gave it for free. */
const CodeError = styled.div`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colorWhite};
`;

export default {
  Background,
  Message,
  SessionMessage,
  Separator,
  CodeError,
};
