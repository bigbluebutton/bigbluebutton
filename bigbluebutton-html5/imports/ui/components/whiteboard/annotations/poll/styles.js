import styled from 'styled-components';

import { pollAnnotationGray } from '/imports/ui/stylesheets/styled-components/palette';

const OutlineText = styled.text`
  stroke: ${pollAnnotationGray};
  stroke-width: .5;

  ${(autoDarkMode) => autoDarkMode && `
    stroke: #888888;
  `}
`;

const OutlineTSpan = styled.tspan`
  stroke: ${pollAnnotationGray};
  stroke-width: .5;

  ${(autoDarkMode) => autoDarkMode && `
    stroke: #888888;
  `}
`;

export default {
  OutlineText,
  OutlineTSpan,
};
