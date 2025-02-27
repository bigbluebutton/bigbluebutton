import styled from 'styled-components';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import CommonIcon from '/imports/ui/components/common/icon/component';
import {
  colorOffWhite,
  colorGrayDark,
  colorGrayLightest,
  colorPrimary,
  colorWhite,
  btnPrimaryActiveBg,
  colorDanger,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  smPaddingX,
  smPaddingY,
  mdPaddingY,
  lgPaddingY,
  titlePositionLeft,
  mdPaddingX,
  borderSizeLarge,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeSmall,
  fontSizeXL,
} from '/imports/ui/stylesheets/styled-components/typography';
import {
  hasPhoneDimentions,
  mediumDown,
  hasPhoneWidth,
  smallOnly,
} from '/imports/ui/stylesheets/styled-components/breakpoints';
import {
  ScrollboxVertical,
} from '/imports/ui/stylesheets/styled-components/scrollable';
import {
  Tab, Tabs, TabList, TabPanel,
} from 'react-tabs';

const Item = styled.li<MetricsTableProps>`
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

const UserConnectionMetricsContainer = styled.div`
   border-right: 1px solid ${colorGrayLightest};
  border-left: 1px solid ${colorGrayLightest};
`;

const ListOccurrenceContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: right;
  flex-direction: column;
  align-items: end;
  `;

const OccurrenceListItem = styled.div`
  width: 100%;
  display: flex;
  justify-content: end;
  flex-direction: row;
  gap: 0.5rem;
  padding: 0.25rem;
  border-bottom: 1px solid ${colorGrayLightest};
`;

type OccurrenceListItemIconProps = {
  status: string;
}

const OccurrenceListItemIcon = styled.div<OccurrenceListItemIconProps>`
  align-self: center;
  border-radius: 50%;
  color: white;
  padding: 0.25em;
  height: 1rem;
  width: 1rem;
  
  display: flex;
  align-items: center;
  justify-content: center;
  justify-self: end;
  background-color: green;
  border: 1px solid darkgreen;

  ${({ status }) => status === 'warning' && `
    background-color: orange;
    border: 1px solid darkorange;
  `}

  ${({ status }) => status === 'danger' && `
    background-color: red;
    border: 1px solid darkred;
  `}

  ${({ status }) => status === 'critical' && `
    background-color: darkred;
    border: 1px solid red;
  `}
`;

const MetricsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const MetricsTable = styled.table`
  border-top: 1px solid ${colorGrayLightest};
  border-bottom: 1px solid ${colorGrayLightest};
  border-collapse: collapse;
`;

type MetricsTableProps = {
  last: boolean;
}

const MetricsTableHeader = styled.th<MetricsTableProps>`
  border-bottom: 1px solid ${colorGrayLightest};
  border-right: 1px solid ${colorGrayLightest};
  padding: 0.5rem;
  text-align: center;
   ${({ last }) => last && `
    border-right: none;
  `}
`;

const MetricsTableData = styled.td<MetricsTableProps>`
  border-bottom: 1px solid ${colorGrayLightest};
  border-right: 1px solid ${colorGrayLightest};
  padding: 0.5rem;
  text-align: center;

  ${({ last }) => last && `
    border-right: none;
  `}
`;

const ColorIndicatorContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: 1rem;
`;

type ColorIndicatorsProps = {
  width: number;
  status: string;
}

const ColorIndicators = styled.div<ColorIndicatorsProps>`
  display: none;
  height: 100%;
  background-color: green;

  ${({ width }) => width && `
    display: flex;
    width: ${width}% !important;
  `}

  ${({ status }) => status === 'warning' && `
    background-color: orange;
  `}

  ${({ status }) => status === 'danger' && `
    background-color: red;
  `}

  ${({ status }) => status === 'critical' && `
    background-color: darkred;
  `}
`;

const Chevron = styled(CommonIcon)`
  height: .5rem;
  width: .5rem;

  ${({ isOpen }) => isOpen && `
    transform: rotate(180deg);
  `}
`;

const FullName = styled(Name)`
  width: 100%;
`;

const ClientNotRespondingText = styled.div`
  display: flex;
  width: 27.5%;
  height: 100%;
  align-items: center;
  justify-content: flex-start;
  color: ${colorDanger};

  @media ${hasPhoneDimentions} {
    width: 100%;
  }
`;

type TextProps = {
  offline: boolean;
}

const Text = styled.div<TextProps>`
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
  width: 8rem;
  height: 100%;
  align-items: anchor-center;
`;

const Time = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: flex-end;
  margin-right: 1rem;
`;

const TimeActive = styled.time`
  color: ${colorPrimary} !important;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: flex-end;
`;

const NetworkDataContainer = styled(ScrollboxVertical)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: nowrap;
  overflow: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 1.25rem;

  &:focus {
    outline: none;

    &::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,.5);
    }
  }

  @media ${mediumDown} {
    justify-content: space-between;
  }
`;

type NetworkDataProps = {
  invisible: boolean;
}

const NetworkData = styled.div<NetworkDataProps>`
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
  padding: ${mdPaddingX} 0 0 0;
`;

const ConnectionStatusModal = styled(ModalSimple)`
  padding: 1rem;
  height: 28rem;

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

type CopyProps = {
  disabled: boolean;
}

const Copy = styled.span<CopyProps>`
  cursor: pointer;
  color: ${colorPrimary};

  &:hover {
    text-decoration: underline;
  }

  ${({ disabled }) => disabled && `
    cursor: not-allowed !important;
  `}
`;

const HelperWrapper = styled.div`
  min-width: 12.5rem;
  height: 100%;

  @media ${mediumDown} {
    flex: none;
    width: 100%;
    scroll-snap-align: start;
    display: flex;
    justify-content: center;
  }
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
  padding: .5rem;
`;

const NetworkDataContent = styled.div`
  margin: 0;
  display: flex;
  justify-content: space-around;
  flex-grow: 1;

  @media ${mediumDown} {
    flex: none;
    width: 100%;
    scroll-snap-align: start;
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

const ConnectionTabs = styled(Tabs)`
  display: flex;
  flex-flow: column;
  justify-content: flex-start;

  @media ${smallOnly} {
    width: 100%;
    flex-flow: column;
  }
`;

const ConnectionTabList = styled(TabList)`
  display: flex;
  flex-flow: row;
  margin: 0;
  margin-bottom: .5rem;
  border: none;
  padding: 0;
  width: calc(100% / 3);

  @media ${smallOnly} {
    width: 100%;
    flex-flow: row;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const ConnectionTabPanel = styled(TabPanel)`
  display: none;
  margin: 0 0 0 1rem;
  height: 13rem;

  [dir="rtl"] & {
    margin: 0 1rem 0 0;
  }

  &.is-selected {
    display: flex;
    flex-flow: column;
  }

  & ul {
    padding: 0;
  }

  @media ${smallOnly} {
    width: 100%;
    margin: 0;
    padding-left: 1rem;
    padding-right: 1rem;
  }
`;

const ConnectionTabSelector = styled(Tab)`
  display: flex;
  flex-flow: row;
  font-size: 0.9rem;
  flex: 0 0 auto;
  justify-content: flex-start;
  border: none !important;
  padding: ${mdPaddingY} ${mdPaddingX};

  border-radius: .2rem;
  cursor: pointer;
  margin-bottom: ${smPaddingY};
  align-items: center;
  flex-grow: 0;
  min-width: 0;

  & > span {
    min-width: 0;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media ${smallOnly} {
    max-width: 100%;
    margin: 0 ${smPaddingX} 0 0;
    & > i {
      display: none;
    }

    [dir="rtl"] & {
       margin: 0 0 0 ${smPaddingX};
    }
  }

  span {
    border-bottom: 2px solid ${colorWhite};
  }

  &.is-selected {
    border: none;
    color: ${colorPrimary};

    span {
      border-bottom: 2px solid ${btnPrimaryActiveBg};
    }
  }
`;

export default {
  Item,
  Left,
  Name,
  Text,
  Avatar,
  Icon,
  Right,
  Time,
  TimeActive,
  NetworkDataContainer,
  NetworkData,
  CopyContainer,
  ConnectionStatusModal,
  ClientNotRespondingText,
  Container,
  Header,
  Title,
  Content,
  Wrapper,
  Status,
  Copy,
  Helper,
  NetworkDataContent,
  FullName,
  DataColumn,
  HelperWrapper,
  ConnectionTabs,
  ConnectionTabList,
  ConnectionTabSelector,
  ConnectionTabPanel,
  ListOccurrenceContainer,
  OccurrenceListItem,
  OccurrenceListItemIcon,
  MetricsContainer,
  MetricsTable,
  MetricsTableHeader,
  MetricsTableData,
  ColorIndicatorContainer,
  ColorIndicators,
  UserConnectionMetricsContainer,
  Chevron,
};
