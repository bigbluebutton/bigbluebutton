import styled, { css, keyframes } from 'styled-components';
import {
  borderSize,
  borderRadius,
  jumboPaddingY,
  smPaddingX,
  smPaddingY,
  contentSidebarPadding,
  contentSidebarBottomScrollPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorPrimary,
  colorGray,
  colorDanger,
  userListBg,
  colorWhite,
  colorGrayLighter,
  colorGrayLightest,
  colorBlueLight,
  listItemBgHover,
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  headingsFontWeight,
  fontSizeSmall,
  fontSizeBase,
} from '/imports/ui/stylesheets/styled-components/typography';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import Button from '/imports/ui/components/common/button/component';
import TextareaAutosize from 'react-autosize-textarea';
import {
  HeaderContainer as BaseHeaderContainer,
  Separator as BaseSeparator,
  PanelContent as BasePanelContent,
} from '/imports/ui/components/sidebar-content/styles';

const HeaderContainer = styled(BaseHeaderContainer)``;

const Separator = styled(BaseSeparator)``;

const PanelContent = styled(BasePanelContent)``;

const BreakoutActions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-weight: ${headingsFontWeight};
  color: ${colorPrimary};

  & > button {
    padding: 0 0 0 .5rem;
  }
`;

const AlreadyConnected = styled.span`
  padding: 0 .5rem 0 0;
  display: inline-block;
  vertical-align: middle;
  white-space: nowrap;
`;
// @ts-ignore - as button comes from JS, we can't provide its props
const JoinButton = styled(Button)`
  flex: 0 1 48%;
  color: ${colorPrimary};
  margin: 0;
  font-weight: inherit;
  padding: 0 .5rem 0 .5rem !important;
`;
// @ts-ignore - as button comes from JS, we can't provide its props
const AudioButton = styled(Button)`
  flex: 0 1 48%;
  color: ${colorPrimary};
  margin: 0;
  font-weight: inherit;
`;

const BreakoutItems = styled.div`
  margin-bottom: 1rem;
`;

const BreakoutRoomList = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: ${fontSizeSmall};
  font-weight: bold;
  padding: ${borderSize} ${borderSize} ${borderSize} 0;

  [dir="rtl"] & {
    padding: ${borderSize} 0 ${borderSize} ${borderSize};
  }
`;

const BreakoutRoomListNameLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UsersAssignedNumberLabel = styled.span`
  margin: 0 0 0 .25rem;

  [dir="rtl"] & {
    margin: 0 .25em 0 0;
  }
`;

const ellipsis = keyframes`
  to {
    width: 1.5em;
  }
`;

type ConnectingAnimationProps = {
  animations: boolean;

};
const ConnectingAnimation = styled.span<ConnectingAnimationProps>`
  &:after {
    overflow: hidden;
    display: inline-block;
    vertical-align: bottom;
    content: "\\2026"; /* ascii code for the ellipsis character */
    width: 0;
    margin: 0 1.25em 0 0;

    [dir="rtl"] & {
      margin: 0 0 0 1.25em;
    }

    ${({ animations }) => animations && css`
      animation: ${ellipsis} steps(4, end) 900ms infinite;
    `}
  }
`;

const BreakoutsList = styled.div`
  overflow: auto;
`;

const JoinedUserNames = styled.div`
  overflow-wrap: break-word;
  white-space: pre-line;
  margin-left: 1rem;
  font-size: ${fontSizeSmall};
`;

const BreakoutColumn = styled.div`
  display: flex;
  flex-flow: column;
  min-height: 0;
  flex-grow: 1;
`;

const BreakoutScrollableList = styled(ScrollboxVertical)`
  background: linear-gradient(${userListBg} 30%, rgba(255,255,255,0)),
    linear-gradient(rgba(255,255,255,0), ${userListBg} 70%) 0 100%,
    radial-gradient(farthest-side at 50% 0, rgba(0,0,0,.2), rgba(0,0,0,0)),
    radial-gradient(farthest-side at 50% 100%, rgba(0,0,0,.2), rgba(0,0,0,0)) 0 100%;

  outline: transparent;
  outline-style: dotted;
  outline-width: ${borderSize};

  &:focus {
    outline: none;
    border-radius: ${borderSize};
    box-shadow: 0 0 0 ${borderSize} ${listItemBgHover}, inset 0 0 0 1px ${colorPrimary};
  }

  &:focus-within,
  &:focus {
    outline-style: solid;
  }

  &:active {
    box-shadow: none;
    border-radius: none;
  }

  overflow-x: hidden;
  outline-width: 1px !important;
  outline-color: transparent !important;
  background: none;
`;

type DurationContainerProps = {
  centeredText: boolean;
};

const DurationContainer = styled.div<DurationContainerProps>`
  ${({ centeredText }) => centeredText && `
    text-align: center;
  `}

  border-radius: ${borderRadius};
  margin-bottom: ${jumboPaddingY};
  padding: 10px;
  box-shadow: 0 0 1px 1px ${colorGrayLightest};
`;

const SetTimeContainer = styled.div`
  margin: .5rem 0 0 0;
`;

const SetDurationInput = styled.input`
  flex: 1;
  border: 1px solid ${colorGrayLighter};
  width: 50%;
  text-align: center;
  padding: .25rem;
  border-radius: ${borderRadius};
  background-clip: padding-box;
  outline: none;

  &::placeholder {
    color: ${colorGray};
    opacity: 1;
  }

  &:focus {
    border-radius: ${borderSize};
    box-shadow: 0 0 0 ${borderSize} ${colorBlueLight}, inset 0 0 0 1px ${colorPrimary};
  }

  &:disabled,
  &[disabled] {
    cursor: not-allowed;
    opacity: .75;
    background-color: rgba(167,179,189,0.25);
  }
`;

const WithError = styled.span`
  color: ${colorDanger};
`;
// @ts-ignore - as button comes from JS, we can't provide its props
const EndButton = styled(Button)`
  padding: .5rem;
  font-weight: ${headingsFontWeight} !important;
  border-radius: .2rem;
  font-size: ${fontSizeSmall};
`;

const Duration = styled.span`
  display: inline-block;
  align-self: center;
`;

const Content = styled(ScrollboxVertical)`
  background: linear-gradient(${colorWhite} 30%, rgba(255,255,255,0)),
    linear-gradient(rgba(255,255,255,0), ${colorWhite} 70%) 0 100%,
    radial-gradient(farthest-side at 50% 0, rgba(0,0,0,.2), rgba(0,0,0,0)),
    radial-gradient(farthest-side at 50% 100%, rgba(0,0,0,.2), rgba(0,0,0,0)) 0 100%;

  background-color: #fff;
  padding: ${contentSidebarPadding} ${contentSidebarPadding} ${contentSidebarBottomScrollPadding};
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  gap: ${contentSidebarPadding};
`;

const FlexRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
`;

const Form = styled.form`
  flex-grow: 0;
  flex-shrink: 0;
  align-self: flex-end;
  width: 100%;
  position: relative;
  margin-bottom: calc(-1 * ${smPaddingX});
  margin-top: .2rem;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const Input = styled(TextareaAutosize)`
  flex: 1;
  background: #fff;
  background-clip: padding-box;
  margin: 0;
  color: ${colorText};
  -webkit-appearance: none;
  padding: calc(${smPaddingY} * 2.5) calc(${smPaddingX} * 1.25);
  resize: none;
  transition: none;
  border-radius: ${borderRadius};
  font-size: ${fontSizeBase};
  line-height: 1;
  min-height: 2.5rem;
  max-height: 10rem;
  border: 1px solid ${colorGrayLighter};

  &:disabled,
  &[disabled] {
    cursor: not-allowed;
    opacity: .75;
    background-color: rgba(167,179,189,0.25);
  }

  &:focus {
    border-radius: ${borderSize};
    box-shadow: 0 0 0 ${borderSize} ${colorBlueLight}, inset 0 0 0 1px ${colorPrimary};
  }

  &:hover,
  &:active,
  &:focus {
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
  }
`;
// @ts-ignore - as button comes from JS, we can't provide its props
const SendButton = styled(Button)`
  margin:0 0 0 ${smPaddingX};
  align-self: center;
  font-size: 0.9rem;

  [dir="rtl"]  & {
    margin: 0 ${smPaddingX} 0 0;
    -webkit-transform: scale(-1, 1);
    -moz-transform: scale(-1, 1);
    -ms-transform: scale(-1, 1);
    -o-transform: scale(-1, 1);
    transform: scale(-1, 1);
  }
`;

const ErrorMessage = styled.div`
  color: ${colorDanger};
  font-size: calc(${fontSizeBase} * .75);
  text-align: left;
  padding: ${borderSize} 0;
  position: relative;
  height: .93rem;
  max-height: .93rem;
`;

export default {
  HeaderContainer,
  Separator,
  PanelContent,
  BreakoutActions,
  AlreadyConnected,
  JoinButton,
  AudioButton,
  BreakoutItems,
  BreakoutRoomList,
  BreakoutRoomListNameLabel,
  UsersAssignedNumberLabel,
  ConnectingAnimation,
  JoinedUserNames,
  BreakoutColumn,
  BreakoutScrollableList,
  DurationContainer,
  SetTimeContainer,
  SetDurationInput,
  WithError,
  EndButton,
  Duration,
  Content,
  FlexRow,
  Form,
  Wrapper,
  Input,
  SendButton,
  ErrorMessage,
  BreakoutsList,
};
