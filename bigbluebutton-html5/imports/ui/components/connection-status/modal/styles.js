import styled from 'styled-components';
import Modal from '/imports/ui/components/modal/simple/component';
import {
  colorOffWhite,
  colorGray,
  colorGrayDark,
  colorGrayLabel,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  smPaddingX,
  smPaddingY,
  lgPaddingY,
  lgPaddingX,
  modalMargin,
  titlePositionLeft,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeSmall,
  fontSizeLarge,
} from '/imports/ui/stylesheets/styled-components/typography';
import { hasPhoneDimentions } from '/imports/ui/stylesheets/styled-components/breakpoints';

const Item = styled.div`
  display: flex;
  width: 100%;
  height: 4rem;

  ${({ even }) => even && `
    background-color: ${colorOffWhite};
  `}
`;

const Left = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const Name = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const Text = styled.div`
  padding-left: .5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${({ offline }) => offline && `
      font-style: italic;
  `}
`;

const ToggleLabel = styled.span`
  margin-right: ${smPaddingX};

  [dir="rtl"] & {
    margin: 0 0 0 ${smPaddingX};
  }
`;

const Avatar = styled.div`
  display: flex;
  width: 4rem;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const Icon = styled.div`
  width: 2.05rem;
  height: 2.05rem;
`;

const Right = styled.div`
  display: flex;
  width: 5rem;
  height: 100%;
`;

const Time = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const DataSaving = styled.div`
  background-color: ${colorOffWhite};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  width: 100%;
`;

const Description = styled.div`
  text-align: center;
  color: ${colorGray};
  margin-bottom: ${smPaddingY};
`;

const Row = styled.div`
  display: flex;
  flex-flow: row;
  flex-grow: 1;
  justify-content: space-between;
  margin-bottom: 0.7rem;
`;

const Col = styled.div`
  display: flex;
  flex-grow: 1;
  flex-basis: 0;

  &:last-child {
    padding-right: 0;
    padding-left: 1rem;

    [dir="rtl"] & {
      padding-right: 0.1rem;
      padding-left: 0;
    }
  }
`;

const FormElement = styled.div`
  position: relative;
  display: flex;
  flex-flow: column;
  flex-grow: 1;
`;

const FormElementRight = styled(FormElement)`
  display: flex;
  justify-content: flex-end;
  flex-flow: row;
`;

const Label = styled.span`
  color: ${colorGrayLabel};
  font-size: ${fontSizeSmall};
  margin-bottom: ${lgPaddingY};
`;

const NetworkDataContainer = styled.div`
  width: 100%;
  display: flex;
  background-color: ${colorOffWhite};
`;

const NetworkData = styled.div`
  float: left;
  font-size: ${fontSizeSmall};
  margin-left: ${smPaddingX};
`;

const CopyContainer = styled.div`
  width: 100%;
`;

const ConnectionStatusModal = styled(Modal)`
  padding: ${smPaddingY};
`;

const Container = styled.div`
  margin: 0 ${modalMargin} ${lgPaddingX};

  @media ${hasPhoneDimentions} {
    margin: 0 1rem;
  }
`;

const Header = styled.div`
  margin: 0;
  padding: 0;
  border: none;
  line-height: ${titlePositionLeft};
  margin-bottom: ${lgPaddingY};
`;

const Title = styled.h2`
  left: ${titlePositionLeft};
  right: auto;
  color: ${colorGrayDark};
  font-weight: bold;
  font-size: ${fontSizeLarge};
  text-align: center;

  [dir="rtl"] & {
    left: auto;
    right: ${titlePositionLeft};
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
`;

const Wrapper = styled.div`
  display: block;
  width: 100%;
  max-height: 16rem;
`;

const Status = styled.div`
  display: flex;
  width: 6rem;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const Copy = styled.span`
  float: right;
  text-decoration: underline;
  cursor: pointer;
  margin-right: ${smPaddingX};

  [dir="rtl"] & {
    margin-left: ${smPaddingX};
    float: left;
  }

  ${({ disabled }) => disabled && `
    cursor: not-allowed !important;
  `}
`;

export default {
  Item,
  Left,
  Name,
  Text,
  ToggleLabel,
  Avatar,
  Icon,
  Right,
  Time,
  DataSaving,
  Description,
  Row,
  Col,
  FormElement,
  Label,
  FormElementRight,
  NetworkDataContainer,
  NetworkData,
  CopyContainer,
  ConnectionStatusModal,
  Container,
  Header,
  Title,
  Content,
  Wrapper,
  Status,
  Copy,
};
