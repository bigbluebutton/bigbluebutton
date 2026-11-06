import styled from 'styled-components';
import { appsPanelTextColor } from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';

const Text = styled.p`
  margin: 0;
  font-size: ${fontSizeBase};
  color: ${appsPanelTextColor};
`;

const Link = styled.a`
  color: ${appsPanelTextColor};
`;

export default {
  Text,
  Link,
};
