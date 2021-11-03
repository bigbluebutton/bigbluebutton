import styled from 'styled-components';

import { smPaddingX } from '/imports/ui/stylesheets/styled-components/general';
import { colorGray, colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';

const UserName = styled.div`
  display: flex;
  flex-flow: column;
  min-width: 0;
  flex-grow: 1;
  margin: 0 0 0 ${smPaddingX};
  justify-content: center;
  font-size: 90%;

  [dir="rtl"]  & {
    margin: 0 ${smPaddingX} 0 0;
  }
`;

const UserNameMain = styled.span`
  margin: 0;
  font-size: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 400;
  color: ${colorGrayDark};
  display: flex;
  flex-direction: row;

  > span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  &.animationsEnabled {
    transition: all .3s;
  }`;

const UserNameSub = styled.span`
  margin: 0;
  font-size: 0.75rem;
  font-weight: 200;
  color: ${colorGray};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  i {
    line-height: 0;
    font-size: 75%;
  }
`;

export default {
  UserName,
  UserNameMain,
  UserNameSub,
};
