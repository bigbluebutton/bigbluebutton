import styled from 'styled-components';

// Stretches a BBButton to fill the flex slot it sits in. BBButton has no
// full-width prop of its own, so panels that lay their footer buttons out in a
// row share this wrapper instead of each declaring the same rules.
const FullWidthButtonWrapper = styled.div`
  flex: 1;
  display: flex;

  > * {
    width: 100%;
  }
`;

// Same, for buttons whose label may not fit: the pair drops to one button per
// line before it gets narrow enough to truncate, and only then ellipsizes.
const TruncatingButtonWrapper = styled(FullWidthButtonWrapper)`
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
  TruncatingButtonWrapper,
};
