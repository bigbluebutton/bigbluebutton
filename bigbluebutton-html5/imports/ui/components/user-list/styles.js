import styled from 'styled-components';

import { FlexColumn } from '/imports/ui/stylesheets/styled-components/placeholders';
import {
  userListBg,
  userListText,
  colorGray,
} from '/imports/ui/stylesheets/styled-components/palette';
import { smPaddingX, lgPaddingX } from '/imports/ui/stylesheets/styled-components/general';

const UserList = styled(FlexColumn)`
  justify-content: flex-start;
  background-color: ${userListBg};
  color: ${userListText};
  height: 100%;
`;

const SmallTitle = styled.h2`
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0 ${smPaddingX};
  margin: 0 0 (${lgPaddingX} / 2) 0;
  color: ${colorGray};
`;

export default {
  UserList,
  SmallTitle,
}
