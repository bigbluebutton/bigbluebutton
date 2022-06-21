import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import {
  pollInputHeight,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
const DownloadStatsBtn = styled(Button)`
  position: relative;
  width: 100%;
  min-height: ${pollInputHeight};
  font-size: ${fontSizeBase};
  overflow-wrap: break-word;
  white-space: pre-wrap;

  &:hover {
    & > span {
      opacity: 1;
    }
  }
`;

export default {
  DownloadStatsBtn
};