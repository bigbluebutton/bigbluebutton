import styled from 'styled-components';
import {
  titlesFontWeight,
  textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';

const Content = styled.div`
  padding: 0 1rem;
`;

const Text = styled.div`
  font-weight: ${titlesFontWeight};
  margin-bottom: 0.25rem;
`;

const IgnoreText = styled.div`
  font-weight: ${textFontWeight};
`;

export default {
  Content,
  Text,
  IgnoreText,
};
