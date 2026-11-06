import styled from 'styled-components';

type SlotProps = {
  $hidden: boolean;
};

// The hidden slot stays mounted and out of flow, rather than display: none, so it can still be
// measured and its content keeps its state (open modals, timers) while collapsed.
const Slot = styled.div<SlotProps>`
  display: flex;
  align-items: center;

  ${({ $hidden }) => $hidden && `
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    inset-inline-start: 0;
  `}
`;

export default {
  Slot,
};
