import styled from 'styled-components';
import SpinnerStyles from '/imports/ui/components/common/loading-screen/styles';

interface SpinnerOverlayProps {
  animations: boolean;
}

const OffsetBottom = styled.div`
  position: relative;
`;

const SpinnerOverlay = styled(SpinnerStyles.Spinner)<SpinnerOverlayProps>`
  & > div {
    background-color: white;
    height: 0.5625rem;
    width: 0.5625rem;
  }
`;

const Bounce1 = styled(SpinnerStyles.Bounce1)<SpinnerOverlayProps>`
  height: 0.5625rem;
  width: 0.5625rem;
`;

const Bounce2 = styled(SpinnerStyles.Bounce2)<SpinnerOverlayProps>`
  height: 0.5625rem;
  width: 0.5625rem;
`;

export default {
  OffsetBottom,
  SpinnerOverlay,
  Bounce1,
  Bounce2,
};
