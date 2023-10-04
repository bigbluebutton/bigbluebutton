import styled from 'styled-components';

const Icon = styled.i`
  ${({ color }) => color && `
    color: ${color};
  `}
  ${({ $rotate }) => $rotate && `
    transform: rotate(180deg);
    margin-top: 20%;
  `}
`;

export default {
  Icon,
};
