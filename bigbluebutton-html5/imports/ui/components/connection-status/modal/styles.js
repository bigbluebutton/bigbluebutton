import styled from 'styled-components';
import Modal from '/imports/ui/components/common/modal/simple/component';
import {
  colorOffWhite,
  colorGray,
  colorGrayDark,
  colorGrayLabel,
  colorGrayLightest,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  smPaddingX,
  smPaddingY,
  lgPaddingY,
  lgPaddingX,
  titlePositionLeft,
  mdPaddingX,
  borderSizeLarge,
  jumboPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeSmall,
  fontSizeXL,
} from '/imports/ui/stylesheets/styled-components/typography';
import {
  hasPhoneDimentions,
  mediumDown,
  hasPhoneWidth,
} from '/imports/ui/stylesheets/styled-components/breakpoints';

const Item = styled.div`
  display: flex;
  width: 100%;
  height: 4rem;
  border-bottom: 1px solid ${colorGrayLightest};

  ${({ last }) => last && `
    border: none;
  `}
`;

const Left = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const Name = styled.div`
  display: flex;
  width: 27.5%;
  height: 100%;
  align-items: center;
  justify-content: flex-start;

  @media ${hasPhoneDimentions} {
    width: 100%;
  }
`;

const FullName = styled(Name)`
  width: 100%;
`;

const Text = styled.div`
  padding-left: .5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${({ offline }) => offline && `
    font-style: italic;
  `}

  [dir="rtl"] & {
    padding: 0;
    padding-right: .5rem;
  }
`;

const ToggleLabel = styled.span`
  margin-right: ${smPaddingX};

  [dir="rtl"] & {
    margin: 0 0 0 ${smPaddingX};
  }
`;

const Avatar = styled.div`
  display: flex;
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
  justify-content: flex-end;
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
  height: 100%;
  display: flex;
  
  @media ${mediumDown} {
    justify-content: space-between;
  }
`;

const NetworkData = styled.div`
  font-size: ${fontSizeSmall};

  ${({ invisible }) => invisible && `
    visibility: hidden;
  `}

  & :first-child {
    font-weight: 600;
  }
`;

const CopyContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  border: none;
  border-top: 1px solid ${colorOffWhite};
  padding: ${jumboPaddingY} 0 0;
`;

const ConnectionStatusModal = styled(Modal)`
  padding: 1.5rem;
  border-radius: 7.5px;

  @media ${hasPhoneDimentions} {
    padding: 1rem;
  }
`;

const Container = styled.div`
  padding: 0 calc(${mdPaddingX} / 2 + ${borderSizeLarge});
`;

const Header = styled.div`
  margin: 0;
  padding: 0;
  border: none;
  line-height: ${titlePositionLeft};
  margin-bottom: ${lgPaddingY};
`;

const Title = styled.h2`
  color: ${colorGrayDark};
  font-weight: 500;
  font-size: ${fontSizeXL};
  text-align: left;
  margin: 0;

  [dir="rtl"] & {
    text-align: right;
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
  cursor: pointer;
  color: ${colorPrimary};

  &:hover {
    text-decoration: underline;
  }

  ${({ disabled }) => disabled && `
    cursor: not-allowed !important;
  `}
`;

const Helper = styled.div`
  width: 12.5rem;
  height: 100%;
  border-radius: .5rem;
  background-color: ${colorOffWhite};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media ${mediumDown} {
    ${({ page }) => page === '1'
    ? 'display: flex;'
    : 'display: none;'}
  }
`;

const NetworkDataContent = styled.div`
  margin: 0;
  display: flex;
  justify-content: space-around;
  flex-grow: 1;

  @media ${mediumDown} {
    ${({ page }) => page === '2'
    ? 'display: flex;'
    : 'display: none;'}
  }
`;

const DataColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media ${hasPhoneWidth} {
    flex-grow: 1;
  }
`;

const Main = styled.div`
  height: 19.5rem;
  display: flex;
  flex-direction: column;
`;

const Body = styled.div`
  padding: ${jumboPaddingY} 0;
  margin: 0;
  flex-grow: 1;
  overflow: auto;
  position: relative;
`;

const Navigation = styled.div`
  display: flex;
  border: none;
  border-bottom: 1px solid ${colorOffWhite};
  user-select: none;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  & :not(:last-child) {
    margin: 0;
    margin-right: ${lgPaddingX};
  }

  .activeConnectionStatusTab {
    border: none;
    border-bottom: 2px solid ${colorPrimary};
    color: ${colorPrimary};
  }

  & * {
    cursor: pointer;
    white-space: nowrap;
  }

  [dir="rtl"] & {
    & :not(:last-child) {
      margin: 0;
      margin-left: ${lgPaddingX};
    }
  }
`;

const Prev = styled.div`
  display: none;
  margin: 0 .5rem 0 .25rem;

  @media ${mediumDown} {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  @media ${hasPhoneWidth} {
    margin: 0;
  }
`;

const Next = styled(Prev)`
  margin: 0 .25rem 0 .5rem;

  @media ${hasPhoneWidth} {
    margin: 0;
  }
`;

const Button = styled.button`
  flex: 0;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  border-radius: 50%;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: .5;
  }

  &:hover {
    opacity: .75;
  }

  &:focus {
    outline: none;
  }

  @media ${hasPhoneWidth} {
    position: absolute;
    bottom: 0;
    padding: .25rem;
  }
`;

const ButtonLeft = styled(Button)`
  left: calc(50% - 2rem);

  [dir="rtl"] & {
    left: calc(50%);
  }
`;

const ButtonRight = styled(Button)`
  right: calc(50% - 2rem);

  [dir="rtl"] & {
    right: calc(50%);
  }
`;

const Chevron = styled.svg`
  display: flex;
  width: 1rem;
  height: 1rem;

  [dir="rtl"] & {
    transform: rotate(180deg);
  }
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
  Helper,
  NetworkDataContent,
  Main,
  Body,
  Navigation,
  FullName,
  DataColumn,
  Prev,
  Next,
  ButtonLeft,
  ButtonRight,
  Chevron,
};
