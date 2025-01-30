import styled from 'styled-components';
import { colorGrayDark, colorGrayIcons } from '/imports/ui/stylesheets/styled-components/palette';
import { smPaddingX } from '/imports/ui/stylesheets/styled-components/general';
import { textFontWeight, titlesFontWeight } from '/imports/ui/stylesheets/styled-components/typography';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';

const UserNameContainer = styled.div`
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

const UserName = styled.span`
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
  font-weight: 400;
  color: ${colorGrayIcons};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  i {
    line-height: 0;
    font-size: 75%;
  }
`;

const StrongName = styled.span`
  font-weight: ${titlesFontWeight};
  font-size: 1rem;
`;

const RegularName = styled.span`
  font-weight: ${textFontWeight};
  font-size: 1rem;
`;

const UserAdditionalInformationIcon = styled(Icon)`
  margin-right: ${smPaddingX};
`;

export default {
  UserNameContainer,
  UserName,
  UserNameSub,
  StrongName,
  RegularName,
  UserAdditionalInformationIcon,
};
