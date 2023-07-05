import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import HoldButton from '/imports/ui/components/presentation/presentation-toolbar/zoom-tool/holdButton/component';
import Button from '/imports/ui/components/common/button/component';
import { FlexRow, FlexColumn } from '/imports/ui/stylesheets/styled-components/placeholders';
import {
  colorDanger,
  colorGray,
  colorGrayLight,
  colorGrayLighter,
  colorWhite,
  colorPrimary,
  colorBlueLight,
  colorBlueLightest,
  colorGrayLightest,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmall, fontSizeBase, fontSizeSmaller } from '/imports/ui/stylesheets/styled-components/typography';
import {
  borderRadius,
  borderSize,
  lgPaddingX,
  lgPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';

const BoxContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 1.6rem 1rem;
  box-sizing: border-box;
  padding-bottom: 1rem;
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-template-areas: "sidebar content";
  grid-gap: 1.5rem;
`;

const Alert = styled.div`
  grid-area: sidebar;
  margin-bottom: 2.5rem;
  ${({ valid }) => valid === false && `
    position: relative;

    & > * {
      border-color: ${colorDanger} !important;
      color: ${colorDanger};
    }
  `}
`;

const FreeJoinLabel = styled.label`
  font-size: ${fontSizeSmall};
  font-weight: bolder;
  display: flex;
  align-items: center;
  font-size: ${fontSizeSmall};
  margin-bottom: 0;

  & > * {
    margin: 0 .5rem 0 0;

    [dir="rtl"] & {
      margin: 0 0 0 .5rem;
    }
  }
`;

const BreakoutNameInput = styled.input`
  width: 100%;
  text-align: center;
  font-weight: 600;
  padding: .25rem .25rem .25rem 0;
  margin: 0;
  &::placeholder {
    color: ${colorGray};
    opacity: 1;
  }
  border: 1px solid ${colorGrayLightest};
  margin-bottom: 1rem;

  ${({ readOnly }) => readOnly && `
    cursor: default;
  `}
`;

const BreakoutBox = styled(ScrollboxVertical)`
  width: 100%;
  height: 10rem;
  border: 1px solid ${colorGrayLightest};
  border-radius: ${borderRadius};
  padding: ${lgPaddingY} 0;

  ${({ hundred }) => hundred && `
  height: 100%;
  `}
`;

const SpanWarn = styled.span`
  ${({ valid }) => valid && `
    display: none;
  `}

  ${({ valid }) => !valid && `
    margin: .25rem;
    position: absolute;
    font-size: ${fontSizeSmall};
    color: ${colorDanger};
    font-weight: 200;
    white-space: nowrap;
  `}
`;

const RoomName = styled(BreakoutNameInput)`
  ${({ value }) => value.length === 0 && `
    border-color: ${colorDanger} !important;
  `}

  ${({ duplicated }) => duplicated === 0 && `
    border-color: ${colorDanger} !important;
  `}
`;

const BreakoutSettings = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; 
  grid-template-rows: 1fr;
  grid-gap: 4rem;

  @media ${smallOnly} {
    grid-template-columns: 1fr ;
    grid-template-rows: 1fr 1fr 1fr; 
    flex-direction: column;
  }
`;

const FormLabel = styled.p`
  color: ${colorGray};
  white-space: nowrap;
  margin-bottom: .5rem;

  ${({ valid }) => !valid && `
    color: ${colorDanger};
  `}
`;

const InputRooms = styled.select`
  background-color: ${colorWhite};
  color: ${colorGray};
  border: 1px solid ${colorGrayLighter};
  border-radius: ${borderRadius};
  width: 100%;
  padding-top: .25rem;
  padding-bottom: .25rem;
  padding: .25rem 0 .25rem .25rem;

  ${({ valid }) => !valid && `
      border-color: ${colorDanger} !important;
  `}
`;

const DurationLabel = styled.label`
  ${({ valid }) => !valid && `
    & > * {
      border-color: ${colorDanger} !important;
      color: ${colorDanger};
    }
  `}
`;

const LabelText = styled.p`
  color: ${colorGray};
  white-space: nowrap;
  margin-bottom: .5rem;

  ${({ bold }) => bold && `
  font-weight: bold;
  font-size: 1.5rem;
  `}
`;

const DurationArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DurationInput = styled.input`
  background-color: ${colorWhite};
  color: ${colorGray};
  border: 1px solid ${colorGrayLighter};
  border-radius: ${borderRadius};
  width: 100%;
  text-align: left;
  padding: .25rem;
  

  &::placeholder {
    color: ${colorGray};
  }
`;

const HoldButtonWrapper = styled(HoldButton)`
  & > button > span {
    padding-bottom: ${borderSize};
  }

  & > button > span > i {
    color: ${colorGray};
    width: ${lgPaddingX};
    height: ${lgPaddingX};
    font-size: 170% !important;
  }
`;

const AssignBtnsContainer = styled.div`
  justify-items: center;
  display: flex;
  flex-flow: row;
  align-items: baseline;
  margin-top: auto;
`;

const AssignBtns = styled(Button)`
  color: ${colorDanger};
  font-size: ${fontSizeSmall};
  white-space: nowrap;
  margin-bottom: 0.5rem;

  ${({ random }) => random && `
  color: ${colorPrimary};
  `}
`;

const CheckBoxesContainer = styled(FlexRow)`
  white-space: nowrap;
  display: flex;
  flex-flow: column;
  justify-content: flex-end; 
`;

const Separator = styled.div`
  width: 100%;
  height: 1px;
  margin: 1rem 0;
  border: 1px solid ${colorGrayLightest};
`;

const FreeJoinCheckbox = styled.input`
  width: 1rem;
  height: 1rem;
`;

const RoomUserItem = styled.p`
  margin: 0;
  padding: .25rem 0 .25rem .25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  display: flex;
  justify-content: space-between;

  [dir="rtl"] & {
    padding: .25rem .25rem .25rem 0;
  }

  span.close {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-right: 5px;
    font-size: ${fontSizeSmaller};
  }

  &:focus {
    background-color: ${colorPrimary};
    color: ${colorWhite};
  }

  ${({ selected }) => selected && `
    background-color: ${colorPrimary};
    color: ${colorWhite};
  `}

  ${({ disabled }) => disabled && `
    cursor: not-allowed;
    color: ${colorGrayLighter};
  `}

  ${({ highlight }) => highlight && `
    background-color: ${colorBlueLightest};
  `}
`;

const LockIcon = styled.span`
  float: right;
  margin-right: 1rem;

  @media ${smallOnly} {
    margin-left: .5rem;
    margin-right: auto;
    float: left;
  }

  &:after {
    font-family: 'bbb-icons' !important;
    content: '\\e926';
    color: ${colorGrayLight};
  }
`;

const ListContainer = styled(FlexColumn)`
  justify-content: flex-start;
`;

const RoomItem = styled.div`
  margin: 1rem 0 1rem 0;
`;

const ItemTitle = styled.h2`
  margin: 0;
  color: ${colorBlueLight};
`;

const ItemButton = styled(Button)`
  padding: 0;
  outline: none !important;

  & > span {
    color: ${colorBlueLight};
  }
`;

const WithError = styled.span`
  color: ${colorDanger};
`;

const SubTitle = styled.p`
  font-size: ${fontSizeBase};
  text-align: justify;
  color: ${colorGray};
`;

const Content = styled(FlexColumn)``;

export default {
  BoxContainer,
  Alert,
  FreeJoinLabel,
  BreakoutNameInput,
  BreakoutBox,
  SpanWarn,
  RoomName,
  BreakoutSettings,
  FormLabel,
  InputRooms,
  DurationLabel,
  LabelText,
  DurationArea,
  DurationInput,
  HoldButtonWrapper,
  AssignBtnsContainer,
  AssignBtns,
  CheckBoxesContainer,
  Separator,
  FreeJoinCheckbox,
  RoomUserItem,
  LockIcon,
  ListContainer,
  RoomItem,
  ItemTitle,
  ItemButton,
  WithError,
  SubTitle,
  Content,
  ContentContainer,
};
