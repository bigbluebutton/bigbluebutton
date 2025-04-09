import styled from 'styled-components';
import { styled as materialStyled } from '@mui/material/styles';
import { Switch } from '@mui/material';
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
  colorGrayLightest,
  appsGalleryOutlineColor,
  colorGrayUserListToolbar,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmall, fontSizeBase, fontSizeSmaller } from '/imports/ui/stylesheets/styled-components/typography';
import {
  borderRadius,
  borderSize,
  contentSidebarBottomScrollPadding,
  contentSidebarPadding,
  lgPaddingX,
  lgPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  Separator as BaseSeparator,
} from '/imports/ui/components/sidebar-content/styles';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';

type withValidProp = {
  valid: boolean;
};

type BreakoutBoxProps = {
  hundred: boolean;
};

type RoomNameProps = {
  value: string;
  duplicated: boolean;
  maxLength: number;
};

type LabelTextProps = {
  bold: boolean;
};

interface RandomAssignButtonProps {
  color: string;
  disabled: boolean;
  label: string;
  onClick: React.MouseEventHandler;
  role: string;
  size: string;
  icon: string;
}

const PanelSeparator = styled(BaseSeparator)``;

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
  grid-gap: 1rem;
`;

const Alert = styled.div<withValidProp>`
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
  margin-bottom: 0.2rem;

  & > * {
    margin: 0 .5rem 0 0;

    [dir="rtl"] & {
      margin: 0 0 0 .5rem;
    }
  }
`;

const SwitchLabel = styled.label`
  font-size: ${fontSizeSmall};
  display: flex;
  align-items: center;
  font-size: ${fontSizeSmall};

  & > * {
    margin: 0 1rem 0 0;

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

const BreakoutBox = styled(ScrollboxVertical)<BreakoutBoxProps>`
  height: 10rem;
  border: 1px solid ${colorGrayLightest};
  border-radius: ${borderRadius};
  padding: ${lgPaddingY} 0;

  ${({ hundred }) => hundred && `
  height: 100%;
  `}
`;

const SpanWarn = styled.span<withValidProp>`
  display: ${({ valid }) => (valid ? 'none' : 'block')};
  margin: .25rem;
  font-size: ${fontSizeSmall};
  color: ${colorDanger};
  font-weight: 200;
  white-space: normal;
  word-break: break-word;
  width: 100%;
`;

const RoomName = styled(BreakoutNameInput)<RoomNameProps>`
  ${({ value }) => value.length === 0 && `
    border-color: ${colorDanger} !important;
  `}

  ${({ duplicated }) => duplicated && `
    border-color: ${colorDanger} !important;
  `}
`;

const BreakoutSettings = styled.div`
  grid-gap: 1.7rem;
  display: flex;
  justify-content: space-around;

  @media ${smallOnly} {
    grid-template-columns: 1fr ;
    grid-template-rows: 1fr 1fr 1fr; 
    flex-direction: column;
  }
`;

const FormLabel = styled.p<withValidProp>`
  color: ${colorGray};
  white-space: nowrap;
  margin-top: .5rem;
  margin-bottom: 0;

  ${({ valid }) => !valid && `
    color: ${colorDanger};
  `}
`;

const InputRoomsLabel = styled.label<withValidProp>`
  padding-top: 0.5rem;
  flex-grow: 1;
  flex-basis: 0;

  ${({ valid }) => !valid && `
    & > * {
      border-color: ${colorDanger} !important;
      color: ${colorDanger};
    }
  `}
`;

const GeneralSelect = `
  background-color: ${colorWhite};
  color: ${colorGray};
  border: 1px solid ${colorGrayLighter};
  border-radius: ${borderRadius};
  width: 100%;
  padding-top: .25rem;
  padding-bottom: .25rem;
  padding: .25rem 0 .25rem .25rem;
  height: 2.7rem;

`;

const InputRooms = styled.select<withValidProp>`
  ${GeneralSelect}
  margin-top: 0.5rem;
  ${({ valid }) => !valid && `
      border-color: ${colorDanger} !important;
  `}
`;

const SlideSelector = styled.select<withValidProp>`
  ${GeneralSelect}
  ${({ valid }) => !valid && `
      border-color: ${colorDanger} !important;
  `}
`;

const DurationLabel = styled.label<withValidProp>`
  padding-top: 0.5rem;
  flex-grow: 1;
  flex-basis: 0;

  ${({ valid }) => !valid && `
    & > * {
      border-color: ${colorDanger} !important;
      color: ${colorDanger};
    }
  `}
`;

const LabelText = styled.p<LabelTextProps>`
  color: ${colorGray};
  white-space: nowrap;
  margin-bottom: 0;
  margin-top: 0;

  ${({ bold }) => bold && `
  font-weight: bold;
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 0;
  `}
`;

const DurationInput = styled.input`
  background-color: ${colorWhite};
  color: ${colorGray};
  border: 1px solid ${colorGrayLighter};
  border-radius: ${borderRadius};
  width: 100%;
  text-align: left;
  padding: .25rem;
  margin-top: .5rem;
  height: 2.7rem;

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
  justify-content: flex-start;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: auto;
  padding-bottom: 0.5rem;
`;
// @ts-ignore - Button is a JS component
const AssignBtns = styled(Button)`
  color: ${colorDanger};
  font-size: ${fontSizeSmall};
  white-space: nowrap;
  margin-bottom: 0;
  flex-shrink: 0;
  min-width: max-content;
  padding-left: 0;
  padding-right: 0;

  ${({ $random }) => $random && `
    color: ${colorPrimary};
  `}
`;

const CheckBoxesContainer = styled(FlexRow)`
  display: flex;
  flex-flow: column;
  justify-content: flex-end;
  padding-top: 1rem;
  width: fit-content;
  grid-gap: 0.5rem;
`;

const FreeJoinCheckbox = styled.input`
  width: 1rem;
  height: 1rem;
`;

const MaterialSwitch = materialStyled(Switch)(({ theme }) => ({
  width: 24,
  height: 14,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      // width: 10,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: colorPrimary,
        ...theme.applyStyles('dark', {
          backgroundColor: colorPrimary,
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 7,
    height: 7,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
    transform: 'translateY(1px)',
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
    ...theme.applyStyles('dark', {
      backgroundColor: 'rgba(255,255,255,.35)',
    }),
  },
}));

const RoomUserItem = styled.p`
  margin: 0;
  padding: .25rem 0 .25rem .25rem;
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

// @ts-ignore - Button is a JS component
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
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
`;

const TitleWrapper = styled.div`
  margin-bottom: 1.7rem;
`;

const Content = styled(ScrollboxVertical)`
  overflow: hidden auto;
  flex-grow: 1;
  padding: 0px ${contentSidebarPadding} ${contentSidebarBottomScrollPadding};
  margin-right: 0.25rem;
`;

const BreakoutSlideLabel = styled.label`
  font-size: ${fontSizeSmall};
  font-weight: bolder;
  display: flex;
  align-items: center;
  font-size: ${fontSizeSmall};
  margin-bottom: 0.2rem;
`;

const ActionButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

// @ts-ignore - Button is a JS component
const ActionButton = styled(Button)`
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  margin: 1.5rem auto;
`;

const Modal = styled(ModalSimple)`
  padding: 0;
  border-radius: 1rem;
  min-width: 50vw;
  max-width: 80vw;
  max-height: 95vh;

  @media ${smallOnly} {
    height: auto !important;
    max-height: 90vh;
    margin: 5vh auto;
    display: flex;
    flex-direction: column;
  }
`;

const ModalContentWrapper = styled.div`
  padding: 1rem;
`;

const RandomAssignLabel = styled.label<withValidProp>`
  padding-top: 0.5rem;
  flex-grow: .5;
  flex-basis: 0;

  ${({ valid }) => !valid && `
    & > * {
      border-color: ${colorDanger} !important;
      color: ${colorDanger};
    }
  `}
`;

// @ts-ignore - Button is JSX element
const RandomAssignButton = styled<RandomAssignButtonProps>(Button)`
  justify-content: center;
  align-items: center;
  height: 3rem;
  border-radius: 1rem;
  border: 1px solid ${appsGalleryOutlineColor};
  background: ${colorGrayUserListToolbar};
  margin-top: 0.5rem;
  width: 100%;
`;

const FooterButton = styled.button`
  width: 12.75rem;
  height: 3.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 1rem;
  cursor: pointer;
  font-size: 16px;
  color: #fff;

  &:first-child {
    background-color: transparent; 
    color: #ccc;
  }

  &:last-child {
    background-color: ${colorPrimary};
  }

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
`;

export default {
  PanelSeparator,
  BoxContainer,
  Alert,
  FreeJoinLabel,
  SwitchLabel,
  BreakoutNameInput,
  BreakoutBox,
  SpanWarn,
  RoomName,
  BreakoutSettings,
  FormLabel,
  InputRooms,
  SlideSelector,
  InputRoomsLabel,
  DurationLabel,
  LabelText,
  DurationInput,
  HoldButtonWrapper,
  AssignBtnsContainer,
  AssignBtns,
  CheckBoxesContainer,
  MaterialSwitch,
  FreeJoinCheckbox,
  RoomUserItem,
  LockIcon,
  ListContainer,
  RoomItem,
  ItemTitle,
  ItemButton,
  WithError,
  SubTitle,
  TitleWrapper,
  Content,
  ContentContainer,
  BreakoutSlideLabel,
  ActionButtonContainer,
  ActionButton,
  Modal,
  ModalContentWrapper,
  RandomAssignLabel,
  RandomAssignButton,
  FooterButton,
};
