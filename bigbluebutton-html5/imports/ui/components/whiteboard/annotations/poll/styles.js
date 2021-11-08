import styled from 'styled-components';

import { pollAnnotationGray } from '/imports/ui/stylesheets/styled-components/palette';

const OutlineText = styled.text`
  stroke: ${pollAnnotationGray};
  stroke-width: .5;
`;

const OutlineTSpan = styled.tspan`
  stroke: ${pollAnnotationGray};
  stroke-width: .5;
`;

export default {
  OutlineText,
  OutlineTSpan,
};
