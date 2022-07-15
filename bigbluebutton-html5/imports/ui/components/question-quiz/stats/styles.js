import styled from 'styled-components';
import {
  colorHeading,
  colorGrayLightest,
  colorBadgeSuccess,
  colorBadgeWarning,
  colorBadgeDanger,
  questioningsuccessDarkColor
} from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';
import {
  pollInputHeight,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase, fontSizeLarge } from '/imports/ui/stylesheets/styled-components/typography';
const PreviewModalContainer = styled.div`
  padding: 1rem;
  padding-top: 1.5rem;
`
const ModalHeading = styled.h4`
  margin-top: 1rem;
  font-weight: 600;
  color: ${colorHeading};
`;

const DownloadStatsBtn = styled(Button)`
  position: relative;
  width: 100%;
  min-height: ${pollInputHeight};
  font-size: ${fontSizeBase};
  overflow-wrap: break-word;
  white-space: pre-wrap;
  margin-top:1rem;
  max-width: 12.2rem;
  margin-left: 1.9rem;
  margin-right: 1.9rem;
  
  &:hover {
    & > span {
      opacity: 1;
    }
  }
`;

const ResultLeft = styled.td`
  padding: 0 .5rem 0 0;
  border-bottom: 1px solid ${colorGrayLightest};
  text-align: center;

  [dir="rtl"] & {
    padding: 0 0 0 .5rem;
  }
  padding-bottom: .25rem;
  word-break: break-all;
`;

const ResultRight = styled.td`
  padding: 0 0 .25rem 0.25rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow:hidden;
  text-align: center;
  max-width:330px;
  @media screen and (max-width: 480px) {
    max-width:200px;
  }
`;

const FinalResult = styled.td`
  padding: 0 0 .25rem 0.25rem;
  white-space: nowrap;
  display:flex;
  background-color:${colorBadgeSuccess};
  border-radius:32px;
  justify-content:center;
  text-overflow: ellipsis;
  overflow:hidden;
  max-width:330px;
  ${({ responseAnswer }) => !responseAnswer && `
  background-color:${colorBadgeWarning};
  `}
  ${({ isCorrect, responseAnswer }) => (!isCorrect && responseAnswer) && `
  background-color:${colorBadgeDanger};
  `}
  @media screen and (max-width: 480px) {
    max-width:200px;
  }
`;

const THeading = styled.th`
  text-align: center;

  [dir="rtl"] & {
    text-align: right;
  }
`;
const Trow = styled.tr`
  display: table-row;
  `;

const MoreStatsButton = styled(Button)`
  padding: 0;
  margin: 0;
  position: relative;
`;

const StatsTitle = styled.h1`
  min-width: 0;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin: 0;
  font-weight: 500;
  font-size: ${fontSizeLarge};
  text-align: center;
  align-self: flex-end;
  margin-bottom:2rem;
  width:100%;
  @media screen and (max-width: 480px) {
    font-size:12px;
    margin-bottom:1rem;
  }
`;

const StatsSubHeading = styled.h3`
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin: 0;
  font-weight: 400;
  text-align: flex-start;
  @media screen and (max-width: 480px) {
    font-size:11px;
  }
`;

const QuestionAndOptionsContainer = styled.div`
  display:block;
  ${({ isHidden }) => isHidden && `
  display:none;
  `}
  @media screen and (max-width: 480px) {
    font-size:10px;
  }
`

const ListOptionItem = styled.p`
  ${({ isCorrect }) => isCorrect && `
  color:${questioningsuccessDarkColor};
  font-weight:bold;
  `}
`
export default {
  PreviewModalContainer,
  ModalHeading,
  DownloadStatsBtn,
  ResultLeft,
  ResultRight,
  FinalResult,
  Trow,
  THeading,
  MoreStatsButton,
  StatsTitle,
  StatsSubHeading,
  QuestionAndOptionsContainer,
  ListOptionItem
};