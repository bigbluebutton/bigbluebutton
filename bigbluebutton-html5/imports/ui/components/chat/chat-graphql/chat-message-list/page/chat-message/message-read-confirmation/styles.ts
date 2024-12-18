import styled from 'styled-components';
import {
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';

export const ReadIcon = styled(Icon)`
  color: ${colorPrimary};
`;

export const IconWrapper = styled.span`
  display: flex;
  align-items: center;
`;
