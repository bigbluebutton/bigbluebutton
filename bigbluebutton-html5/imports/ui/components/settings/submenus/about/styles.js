import styled from 'styled-components';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';

const Text = styled.p`
  margin: 0;
  font-size: ${fontSizeBase};
  color: #333;
`;

const Link = styled.a`
  color: #333;
`;

export default {
  Text,
  Link,
};
