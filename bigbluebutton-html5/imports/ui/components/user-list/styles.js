import styled from 'styled-components';

import { FlexColumn } from '/imports/ui/stylesheets/styled-components/placeholders';
import {
  userListBg,
  userListText,
} from '/imports/ui/stylesheets/styled-components/palette';

const UserList = styled(FlexColumn)`
  justify-content: flex-start;
  background-color: ${userListBg};
  color: ${userListText};
  height: 100%;
`;

export default {
  UserList,
}
