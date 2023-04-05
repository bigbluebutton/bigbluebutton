import styled from 'styled-components';

const SkeletonUserItemContents = styled.div`
  position: static;
  padding: .45rem;
  margin-left: .5rem;
  margin-right: .5rem;
  width: auto;
`;
const UserAvatar = styled.div`
  flex: 0 0 2.25rem;
`;
const SkeletonWrapper = styled.span`
  width: 100%;
`;

export default {
  SkeletonUserItemContents,
  UserAvatar,
  SkeletonWrapper,
};