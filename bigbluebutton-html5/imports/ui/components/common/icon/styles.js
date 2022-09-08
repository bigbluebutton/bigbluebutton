import styled from 'styled-components';

const Icon = styled.i`
  ${({ $rotate }) => $rotate && `
    transform: rotate(180deg);
    margin-top: 20%;
  `}
`;

export default {
  Icon,
};
