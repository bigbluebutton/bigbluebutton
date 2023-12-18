import styled from 'styled-components';
import Icon from '/imports/ui/components/common/icon/component';
import { colorDanger, colorSuccess, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

const Voice = styled(Icon)`
  height: 80%;
  color: ${colorWhite};
  border-radius: 50%;

  &::before {
    font-size: 80%;
  }

  background-color: ${colorSuccess};
`;

const Muted = styled(Icon)`
  height: 80%;
  color: ${colorWhite};
  border-radius: 50%;

  &::before {
    font-size: 80%;
  }

  background-color: ${colorDanger};
`;

export default {
  Voice,
  Muted,
};
