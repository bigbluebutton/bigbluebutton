import styled from 'styled-components';
import { smPaddingX } from '/imports/ui/stylesheets/styled-components/general';
import Resizable from 're-resizable';
import Icon from '/imports/ui/components/common/icon/component';
import Button from '/imports/ui/components/common/button/component';

const ToggleLabel = styled.span`
  margin-right: ${smPaddingX};

  [dir="rtl"] & {
    margin: 0 0 0 ${smPaddingX};
  }
`;

const DebugWindowWrapper = styled(Resizable)`
  position: absolute !important;
  z-index: 9;
`;

const DebugWindow = styled.div`
  min-width: 20vw;
  min-height: 20vh;
  width: 100%;
  height: 100%;
  background-color: white;
  border: 2px solid #06172A;

  &::after {
    content: "";
    -webkit-transform: rotate(-45deg);
    position: absolute;
    right: 2px;
    bottom: 8px;
    pointer-events: none;
    width: 14px;
    height: 1px;
    background: rgba(0,0,0,.5);
  }

  &::before {
    content: "";
    -webkit-transform: rotate(-45deg);
    position: absolute;
    right: 2px;
    bottom: 5px;
    pointer-events: none;
    width: 8px;
    height: 1px;
    background: rgba(0,0,0,.5);
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid lightgray;
  cursor: move;

  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const MoveIcon = styled(Icon)`
  margin: 5px;
  color: rgba(0,0,0,.5);
`;

const Title = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
`;

const CloseButton = styled(Button)`
  & > span > i {
    font-size: 115%;
  }
`;

const DebugWindowContent = styled.div`
  padding: 10px;
`;

const Table = styled.div`
  display: table;
  width: 100%;
`;

const TableRow = styled.div`
  display: table-row;
`;

const TableCell = styled.div`
  display: table-cell;
  padding: 5px;
  vertical-align: middle;
`;

const UserAgentInput = styled.input`
  margin-right: 5px;
`;

const AutoArrangeToggle = styled.input`
  margin-right: 5px;
`;

const CellContent = styled.div`
  display: flex;
  align-items: center;
`;

export default {
  ToggleLabel,
  DebugWindowWrapper,
  DebugWindow,
  Header,
  MoveIcon,
  Title,
  CloseButton,
  DebugWindowContent,
  Table,
  TableRow,
  TableCell,
  UserAgentInput,
  AutoArrangeToggle,
  CellContent,
};
