import styled from 'styled-components';
import {
  colorWhite,
  colorDanger,
  colorWarning,
  colorSuccess,
} from '/imports/ui/stylesheets/styled-components/palette';

const SignalBars = styled.div`
  align-items: flex-end;
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100%;

  ${({ grayscale }) => grayscale && `
    & > div {
      background-color: ${colorWhite};
    }
  `}

  ${({ grayscale, level }) => !grayscale && level === 'critical' && `
    & > div {
      background-color: ${colorDanger};
    }
  `}

  ${({ grayscale, level }) => !grayscale && level === 'danger' && `
    & > div {
      background-color: ${colorWarning};
   }
  `}

  ${({ grayscale, level }) => !grayscale && level === 'warning' && `
    & > div {
      background-color: ${colorSuccess};
    }
  `}

  ${({ grayscale, level }) => !grayscale && level === 'normal' && `
    & > div {
      background-color: ${colorWhite};
    }
  `}
`;

const Bar = styled.div`
  width: 20%;
  border-radius: .46875em;
`;

const FirstBar = styled(Bar)`
  height: 25%;
`;

const SecondBar = styled(Bar)`
  height: 50%;

  ${({ active }) => !active && `
    opacity: .5;
  `}
`;

const ThirdBar = styled(Bar)`
  height: 75%;

  ${({ active }) => !active && `
    opacity: .5;
  `}
`;

const FourthBar = styled(Bar)`
  height: 100%;

  ${({ active }) => !active && `
    opacity: .5;
  `}
`;

export default {
  SignalBars,
  FirstBar,
  SecondBar,
  ThirdBar,
  FourthBar,
};
