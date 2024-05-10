import styled from 'styled-components';
import {
  colorGray,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeSmaller,
  fontSizeXL,
} from '/imports/ui/stylesheets/styled-components/typography';

const Text = styled.span`
  text-transform: uppercase;
  color: ${colorGray};
  font-size: ${fontSizeSmaller};
  font-weight: 600;
`;

const Time = styled.span`
  font-size: ${fontSizeXL};
  font-weight: 600;
  color: ${colorGray};
`;

export {
  Text,
  Time,
};
