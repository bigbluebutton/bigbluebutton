import styled from 'styled-components';

const Container = styled.span`
  display: flex;
  flex-flow: row;
  position: relative;

  & > div {
    position: relative;
  }

  & > :last-child {
    margin-right: 0;
  }
`;
export default {
  Container,
};
