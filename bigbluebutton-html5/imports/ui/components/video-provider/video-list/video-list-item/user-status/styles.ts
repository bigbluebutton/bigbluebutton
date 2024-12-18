// @ts-nocheck
/* eslint-disable */
import styled from 'styled-components';
import Icon from '/imports/ui/components/common/icon/component';
import { colorDanger, colorSuccess, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

const Voice = styled(Icon)`
  height: 1.1rem;
  width: 1.1rem;
  margin-left: 0.5rem;
  color: ${colorWhite};
  border-radius: 50%;

  &::before {
    font-size: 80%;
  }

  background-color: ${colorSuccess};
`;

const Muted = styled(Icon)`
  height: 1.1rem;
  width: 1.1rem;
  color: ${colorWhite};
  border-radius: 50%;
  margin-left: 0.5rem;

  &::before {
    font-size: 80%;
  }

  background-color: ${colorDanger};
`;

export default {
  Voice,
  Muted,
};
