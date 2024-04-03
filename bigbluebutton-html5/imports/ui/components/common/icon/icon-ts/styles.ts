import styled from 'styled-components';

type IconProps = {
  $rotate: boolean;
  className: string;
};

const Icon = styled.i<IconProps>`
  ${({ $rotate }) => $rotate && `
    transform: rotate(180deg);
    margin-top: 20%;
  `}
`;

export default {
  Icon,
};
