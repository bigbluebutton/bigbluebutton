import styled from 'styled-components';
import { colorDanger, colorGray, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const Notes = styled.div`
  background-color: ${colorWhite};
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;

  @media ${smallOnly} {
    transform: none !important;
    &.no-padding {
      padding: 0;
    }
  }
`;

const WarningNotificationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
  flex-grow: 1;
`;

const ErrorMessage = styled.p`
  color: ${colorDanger};
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const WaringMessage = styled.p`
  color: ${colorGray};
  font-size: 1rem;
  margin-bottom: 1rem;
`;

export default {
  Notes,
  WarningNotificationContainer,
  ErrorMessage,
  WaringMessage,
};
