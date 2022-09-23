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
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmall, fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import {
  borderRadius,
  borderSize,
  lgPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';

const BoxContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 1.6rem 1rem;
  box-sizing: border-box;
  padding-bottom: 1rem;
`;

const Alert = styled.div`
  ${({ valid }) => !valid && `
    position: relative;

    & > * {
      border-color: ${colorDanger} !important;
      color: ${colorDanger};
    }
  `}

  grid-row: span 3;

  & > div {
    height: 25.2rem;
    max-height: 25.2rem;
  }
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
  text-align: left;
  font-weight: normal;
  padding: .25rem;
  margin: 0;
  &::placeholder {
    color: ${colorGray};
    opacity: 1;
  }
`;

const BreakoutBox = styled(ScrollboxVertical)`
  width: 100%;
  min-height: 6rem;
  max-height: 8rem;
  border: 1px solid ${colorGrayLighter};
  border-radius: ${borderRadius}; 
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
  grid-template-columns: 2fr 2fr 1fr; 
  grid-template-rows: 1fr;
  grid-gap: 1rem;

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
  width: 50%;
  text-align: center;
  padding: .25rem;

  &::placeholder {
    color: ${colorGray};
    opacity: 1;
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
  margin-top: auto;
`;

const AssignBtns = styled(Button)`
  color: ${colorPrimary};
  font-size: ${fontSizeSmall};
  white-space: nowrap;
  margin: 3px auto;
  align-self: flex-end;
  width: 100%;
`;

const CheckBoxesContainer = styled(FlexRow)`
  margin-top: 2rem;
  margin-bottom: 0.25rem;
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
  border-bottom: solid .5px ${colorGrayLighter};

  [dir="rtl"] & {
    padding: .25rem .25rem .25rem 0;
  }

  ${({ selected }) => selected && `
    background-color: ${colorPrimary};
    color: ${colorWhite};
  `}

  ${({ disabled }) => disabled && `
    cursor: not-allowed;
    color: ${colorGrayLighter};
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
};
