import styled from 'styled-components';
import { lgPaddingY, toastMargin } from '/imports/ui/stylesheets/styled-components/general';

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${lgPaddingY};
  margin-top: ${toastMargin};
`;

export default {
  Actions,
};
