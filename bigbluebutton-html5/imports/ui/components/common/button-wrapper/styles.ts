import styled from 'styled-components';

// Stretches a BBButton to fill its wrapper. BBButton has no full-width prop of
// its own, so panels that need one share this instead of each declaring the
// same rules.
//
// Deliberately carries no `flex` of its own: some call sites are themselves
// flex items in a column (a footer pinned with `margin-top: auto`), where
// `flex: 1` would make the wrapper grow and push the button out of place. Rows
// that do want the button to share the width use FullWidthFlexItem below.
const FullWidthButtonWrapper = styled.div`
  display: flex;

  > * {
    width: 100%;
  }
`;

// The row case: an equal-width slot in a flex row of buttons.
const FullWidthFlexItem = styled(FullWidthButtonWrapper)`
  flex: 1;
`;

// Same, for buttons whose label may not fit: the pair drops to one button per
// line before it gets narrow enough to truncate, and only then ellipsizes.
const TruncatingButtonWrapper = styled(FullWidthFlexItem)`
  flex: 1 1 10rem;
  min-width: 0;

  > * {
    min-width: 0;
  }

  button span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
`;

export default {
  FullWidthButtonWrapper,
  FullWidthFlexItem,
  TruncatingButtonWrapper,
};
