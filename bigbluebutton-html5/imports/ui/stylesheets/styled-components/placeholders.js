import styled from 'styled-components';

const FlexColumn = styled.div`
  display: flex;
  flex-flow: column;
`;

const FlexRow = styled.div`
  display: flex;
  flex-flow: row;
`;

const TextElipsis = styled.span`
  min-width: 0;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TitleElipsis = styled.h2`
  min-width: 0;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export {
  FlexColumn,
  FlexRow,
  TextElipsis,
  TitleElipsis,
};
