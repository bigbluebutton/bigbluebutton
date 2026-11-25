// @ts-nocheck
/* eslint-disable */
import styled from 'styled-components';
import Icon from '/imports/ui/components/common/icon/component';
import { colorDanger, colorSuccess, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmaller } from '/imports/ui/stylesheets/styled-components/typography';

const VoiceBadgeBase = styled(Icon)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1rem;
  width: 1rem;
  line-height: 1;
  margin-inline-start: 0.5rem;
  color: ${colorWhite};
  border-radius: 50%;

  &::before {
    font-size: ${fontSizeSmaller};
    line-height: 1;
  }
`;

const Voice = styled(VoiceBadgeBase)`
  background-color: ${colorSuccess};
`;

const Muted = styled(VoiceBadgeBase)`
  background-color: ${colorDanger};
`;

export default {
  Voice,
  Muted,
};
