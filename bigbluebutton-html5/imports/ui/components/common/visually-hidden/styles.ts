import styled, { css } from 'styled-components';

// Removes content from the visual layout while leaving it in the accessibility
// tree, for text that only screen readers should reach: labels a control points
// at via aria-labelledby, and inputs a custom control renders on top of.
//
// Exported as a mixin as well as a ready-made span because the existing call
// sites hide three different elements (span, div, input); the mixin lets each
// keep its own tag.
export const visuallyHidden = css`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
`;

const VisuallyHidden = styled.span`
  ${visuallyHidden}
`;

export default {
  VisuallyHidden,
};
