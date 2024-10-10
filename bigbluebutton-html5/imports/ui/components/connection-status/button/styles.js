import styled from 'styled-components';

const IconWrapper = styled.div`
  width: 1.025rem;
  height: 1.025rem;
`;

const ButtonWrapper = styled.div`
  ${({ isMobile }) => isMobile && `
    margin: 0 0 0 .2rem;
  `}
  margin: 0 .5rem;
`;

export default {
  IconWrapper,
  ButtonWrapper,
};
