import styled from 'styled-components';
import {
  colorGrayLightest, colorOffWhite, colorPrimary, colorText,
} from '/imports/ui/stylesheets/styled-components/palette';
import { $3xlPadding, lgPadding } from '/imports/ui/stylesheets/styled-components/general';

const Container = styled.div`
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  background-color: ${colorOffWhite};
  box-shadow: inset 0 0 0 1px ${colorGrayLightest};
  padding: ${lgPadding} ${$3xlPadding};
  position: relative;
  overflow: hidden;
  cursor: pointer;

  [dir='ltr'] & {
    border-right: 0.5rem solid ${colorPrimary};
  }

  [dir='rtl'] & {
    border-left: 0.5rem solid ${colorPrimary};
  }
`;

const Typography = styled.div`
  overflow: hidden;
`;

const Username = styled(Typography)`
  font-weight: bold;
  color: ${colorPrimary};
  line-height: 1rem;
  font-size: 1rem;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Message = styled(Typography)`
  max-height: 1rem;
  line-height: 1rem;
  overflow: hidden;
`;

export const DeleteMessage = styled.span`
  font-style: italic;
  font-weight: bold;
  color: ${colorText};
`;

export default {
  Container,
  Username,
  Message,
  DeleteMessage,
};
