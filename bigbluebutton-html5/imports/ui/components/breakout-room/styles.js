import styled, { css, keyframes } from 'styled-components';
import {
  mdPaddingX,
  borderSize,
  listItemBgHover, borderSizeSmall,
  borderRadius,
  jumboPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorPrimary,
  colorGray,
  colorDanger,
  userListBg,
  colorWhite,
  colorGrayLighter,
  colorGrayLightest,
  colorBlueLight
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  headingsFontWeight,
  fontSizeSmall,
} from '/imports/ui/stylesheets/styled-components/typography';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import Button from '/imports/ui/components/common/button/component';

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

const JoinButton = styled(Button)`
  flex: 0 1 48%;
  color: ${colorPrimary};
  margin: 0;
  font-weight: inherit;
  padding: 0 .5rem 0 .5rem !important;
`;

const AudioButton = styled(Button)`
  flex: 0 1 48%;
  color: ${colorPrimary};
  margin: 0;
  font-weight: inherit;
`;

const BreakoutItems = styled.div`
  margin-bottom: 1rem;
`;

const Content = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: ${fontSizeSmall};
  font-weight: bold;
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
`

const ConnectingAnimation = styled.span`
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

const DurationContainer = styled.div`
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

const Panel = styled(ScrollboxVertical)`
  background: linear-gradient(${colorWhite} 30%, rgba(255,255,255,0)),
    linear-gradient(rgba(255,255,255,0), ${colorWhite} 70%) 0 100%,
    radial-gradient(farthest-side at 50% 0, rgba(0,0,0,.2), rgba(0,0,0,0)),
    radial-gradient(farthest-side at 50% 100%, rgba(0,0,0,.2), rgba(0,0,0,0)) 0 100%;

  background-color: #fff;
  padding: ${mdPaddingX};
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
`;

const Separator = styled.div`
  position: relative;
  width: 100%;
  height: 10px;
  height: ${borderSizeSmall};
  background-color: ${colorGrayLighter};
  margin: 30px 0px;
`;

const FlexRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
`;

export default {
  BreakoutActions,
  AlreadyConnected,
  JoinButton,
  AudioButton,
  BreakoutItems,
  Content,
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
  Panel,
  Separator,
  FlexRow,
};
