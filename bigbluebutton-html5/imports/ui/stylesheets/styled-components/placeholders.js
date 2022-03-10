import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';

const FlexColumn = styled.div`
  display: flex;
  flex-flow: column;
`;

const FlexRow = styled.div`
  display: flex;
  flex-flow: row;
`;

const DivElipsis = styled.div`
  min-width: 0;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

const HeaderElipsis = styled.h3`
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ButtonElipsis = styled(Button)`
  min-width: 0;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export {
  FlexColumn,
  FlexRow,
  DivElipsis,
  TextElipsis,
  TitleElipsis,
  HeaderElipsis,
  ButtonElipsis,
};
