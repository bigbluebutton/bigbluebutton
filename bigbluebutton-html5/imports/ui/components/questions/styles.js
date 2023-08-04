import styled, { css } from 'styled-components';
import {
  borderSize,
  borderSizeLarge,
  mdPaddingX,
  mdPaddingY,
  pollHeaderOffset,
  smPaddingX,
  smPaddingY,
  toastContentWidth
} from '/imports/ui/stylesheets/styled-components/general';

import {
  colorGray,
  colorGrayLight,
  colorGrayLighter,
  colorWhite,
  colorPrimary,
  colorBlack,
  colorGrayDark,
} from '../../stylesheets/styled-components/palette';

import {
  fontSizeBase,
  fontSizeSmaller,
  lineHeightBase,
  lineHeightComputed
} from '/imports/ui/stylesheets/styled-components/typography';

import Button from '/imports/ui/components/common/button/component';
import { TextElipsis } from '/imports/ui/stylesheets/styled-components/placeholders';
import TextInput from '/imports/ui/components/text-input/component';

const Questions = styled.div`
  background-color: ${colorWhite};
  padding:
    ${mdPaddingX}
    ${mdPaddingY}
    ${mdPaddingX}
    ${mdPaddingX};

  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: space-around;
  overflow: hidden;
  height: 100%;
  transform: translateZ(0);
`;

const QuestionColor = css`
  color: ${colorBlack};
`

const AnswerColor = css`
  ${({ answered }) => answered && `
    color: ${colorGrayLight};
  `}
`;

const QuestionOrAnsweredColor = css`
  ${QuestionColor}
  ${AnswerColor}
`;

const Header = styled.header`
  position: relative;
  top: ${pollHeaderOffset};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled(TextElipsis)`
  flex: 1;

  & > button, button:hover {
    max-width: ${toastContentWidth};
  }
`;

const HideButton = styled(Button)`
  position: relative;
  background-color: ${colorWhite};
  display: block;
  margin: ${borderSizeLarge};
  margin-bottom: ${borderSize};
  padding-left: 0;
  padding-right: inherit;

  [dir="rtl"] & {
    padding-left: inherit;
    padding-right: 0;
  }

  > i {
      color: ${colorGrayDark};
      font-size: smaller;

      [dir="rtl"] & {
        -webkit-transform: scale(-1, 1);
        -moz-transform: scale(-1, 1);
        -ms-transform: scale(-1, 1);
        -o-transform: scale(-1, 1);
        transform: scale(-1, 1);
      }
  }

  &:hover {
      background-color: ${colorWhite};
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-flow: column;
  flex-grow: 1;
  flex-shrink: 1;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  padding-left: ${smPaddingX};
  margin-left: calc(-1 * ${mdPaddingX});
  padding-right: ${smPaddingY};
  margin-right: calc(-1 * ${mdPaddingY});
  padding-bottom: ${mdPaddingX};
  margin-bottom: calc(-1 * ${mdPaddingX});

  [dir="rtl"] & {
    padding-right: ${mdPaddingX};
    margin-right: calc(-1 * ${mdPaddingX});
    padding-left: ${mdPaddingY};
    margin-left: calc(-1 * ${mdPaddingX});
  }
`;

const List = styled.div`
  @include scrollbox-vertical();
  overflow-x: hidden;
  flex-grow: 2;
  flex-basis: 0;
  margin: 0 auto 0 0;
  padding-top: 0;
  width: 100%;

  [dir="rtl"] & {
    margin: 0 0 0 auto;
    padding: 0 0 0 ${mdPaddingX};
  }

  &:after {
    content: "";
    display: block;
    height: ${mdPaddingX};
  }
`;

const DescriptionWrapper = styled.div`
  width: 100%;
  margin-bottom: calc(${lineHeightComputed} / 2);
  padding-left: 1.7rem;
  padding-right: 5px;
`;

const Description = styled.p`
  margin: 0;
  font-size: smaller;
  color: ${colorGray};
`;

const AutoApprove = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: calc(${lineHeightComputed} / 2);
  padding-left: 1.7rem;
  padding-right: 1.7rem;
`;

const AutoApproveLabel = styled.p`
  margin: 0;
  font-size: small;
`;

const QuestionWrapper = styled.div`
  width: 100%;
  margin-bottom: ${lineHeightComputed};
  padding-left: 1.7rem;
  padding-right: 5px;
`;

const Content = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  word-wrap: break-word;
  margin-top: 5px;

  ${({ hasActions })=> hasActions && `
    &:hover {
      background-color: ${colorGrayLighter};
      box-shadow: 0 0 0 5px ${colorGrayLighter};
    }
  `}
`;

const BBBMenuWrapper = styled.div`
  cursor: pointer;
  width: 100%;
`;

const Meta = styled.div`
  display: flex;
  flex-flow: column;
  line-height: ${lineHeightBase};

  &:focus {
    outline: none;
  }
`;

const Text = styled.div`
  flex: 1;
  display: flex;
  flex-flow: column;
  overflow: hidden;
  word-break: break-word;
  font-size: ${fontSizeBase};
  font-weight: 600;

  ${QuestionOrAnsweredColor}
`;

const UserName = styled.div`
  margin-top: 3px;
  font-size: ${fontSizeSmaller};

  ${QuestionOrAnsweredColor}
`;

const Upvote = styled.div`
  margin-top: 2px;
  margin-left: 5px;
  display: flex;
  flex-flow: row nowrap;
  align-items: baseline;
`;

const VoteButton = styled(Button)`
  > span:nth-child(2) {
    width: 0;
  }

  ${({ noUpVoted }) => noUpVoted && `
    :first-child {
      background-color: transparent;
      border-color: ${colorPrimary};
      color: ${colorPrimary};
    }
  `}
`;

const NumUpVotes = styled.span`
  margin-left: 5px;
  font-size: small;

  ${QuestionOrAnsweredColor}
`;

const Separator = styled.hr`
  background-color: ${colorGrayLighter};
  margin: 20px auto;
  border: 0;
  width: 90%;
  height: 2px;
`;

const SendQuestionTextInput = styled(TextInput)`
  margin-top: 5px;
`;

export default {
  Questions,
  Header,
  Title,
  HideButton,
  Wrapper,
  List,
  DescriptionWrapper,
  Description,
  AutoApprove,
  AutoApproveLabel,
  QuestionWrapper,
  Content,
  BBBMenuWrapper,
  Meta,
  Text,
  UserName,
  Upvote,
  VoteButton,
  NumUpVotes,
  Separator,
  SendQuestionTextInput,
}