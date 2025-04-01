import styled from 'styled-components';

type IconProps = {
  $rotate: boolean;
};

const Icon = styled.i<IconProps>`
  ${({ $rotate }) => $rotate && `
    transform: rotate(180deg);
  `}
  display: flex;
`;

export default {
  Icon,
};
