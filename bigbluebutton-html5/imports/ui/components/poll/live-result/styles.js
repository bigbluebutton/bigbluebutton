import styled, { css, keyframes } from 'styled-components';
import {
  colorGrayLightest,
  colorText,
  colorGrayLighter,
  pollStatsBorderColor,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  smPaddingX,
  smPaddingY,
  mdPaddingX,
  pollStatsElementWidth,
  pollSmMargin,
  pollResultWidth,
  borderSizeLarge,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import Button from '/imports/ui/components/common/button/component';

const ResultLeft = styled.td`
  padding: 0 .5rem 0 0;
  border-bottom: 1px solid ${colorGrayLightest};

  [dir="rtl"] & {
    padding: 0 0 0 .5rem;
  }
  padding-bottom: .25rem;
  word-break: break-all;
`;

const ResultRight = styled.td`
  padding-bottom: .25rem;
  word-break: break-all;
`;

const Main = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Left = styled.div`
  font-weight: bold;
  max-width: ${pollResultWidth};
  min-width: ${pollStatsElementWidth};
  word-wrap: break-word;
  flex: 6;

  padding: ${smPaddingY};
  margin-top: ${pollSmMargin};
  margin-bottom: ${pollSmMargin};
  color: ${colorText};

  position: relative;
`;

const Center = styled.div`
  position: relative;
  flex: 3;
  border-left: 1px solid ${colorGrayLighter};
  border-right : none;
  width: 100%;
  height: 100%;

  [dir="rtl"] & {
    border-left: none;
    border-right: 1px solid ${colorGrayLighter};
  }

  padding: ${smPaddingY};
  margin-top: ${pollSmMargin};
  margin-bottom: ${pollSmMargin};
  color: ${colorText};
`;

const Right = styled.div`
  text-align: right;
  max-width: ${pollStatsElementWidth};
  min-width: ${pollStatsElementWidth};
  flex: 1;

  [dir="rtl"] & {
    text-align: left;
  }

  padding: ${smPaddingY};
  margin-top: ${pollSmMargin};
  margin-bottom: ${pollSmMargin};
  color: ${colorText};

  position: relative;
`;

const BarShade = styled.div`
  background-color: ${colorGrayLighter};
  height: 100%;
  min-height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
`;

const BarVal = styled.div`
  position: inherit;
`;

const Stats = styled.div`
  margin-bottom: ${smPaddingX};
  display: flex;
  flex-direction: column;
  border: 1px solid ${pollStatsBorderColor};
  border-radius: ${borderSizeLarge};
  padding: ${mdPaddingX};

  & > div {
    display: flex;
    flex-direction: row;

    & > div:nth-child(even) {
      position: relative;
      height: 75%;
      width: 50%;
      text-align: center;
    }
  }
`;

const Title = styled.span`
  font-weight: bold;
  word-break: break-all;
  white-space: pre-wrap;
`;

const Status = styled.div`
  margin-bottom: .5rem;
`;

const ellipsis = keyframes`
  to {
    width: 1.25em;
    margin-right: 0;
    margin-left: 0;
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

const ButtonsActions = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const PublishButton = styled(Button)`
  width: 48%;
  overflow-wrap: break-word;
  white-space: pre-wrap;
`;

const CancelButton = styled(PublishButton)``;

const LiveResultButton = styled(Button)`
  width: 100%;
  margin-top: ${smPaddingY};
  margin-bottom: ${smPaddingY};
  font-size: ${fontSizeBase};
  overflow-wrap: break-word;
  white-space: pre-wrap;
`;

const Separator = styled.div`
  display: flex;
  flex: 1 1 100%;
  height: 1px;
  min-height: 1px;
  background-color: ${colorGrayLightest};
  padding: 0;
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

const THeading = styled.th`
  text-align: left;

  [dir="rtl"] & {
    text-align: right;
  }
`;

export default {
  ResultLeft,
  ResultRight,
  Main,
  Left,
  Center,
  Right,
  BarShade,
  BarVal,
  Stats,
  Title,
  Status,
  ConnectingAnimation,
  ButtonsActions,
  PublishButton,
  CancelButton,
  LiveResultButton,
  Separator,
  THeading,
};
