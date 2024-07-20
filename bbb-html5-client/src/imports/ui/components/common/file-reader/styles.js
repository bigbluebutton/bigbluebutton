import styled, { css, keyframes } from 'styled-components';
import Icon from '/imports/ui/components/common/icon/component';
import {
  colorDanger,
  colorGray,
  colorGrayLightest,
  colorSuccess,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fileLineWidth,
  iconPaddingMd,
  mdPaddingY,
  statusIconSize,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  headingsFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';

const rotate = keyframes`
  0% { transform: rotate(0); }
  100% { transform: rotate(360deg); }
`;

const ToastIcon = styled(Icon)`
  font-size: 117%;
  width: ${statusIconSize};
  height: ${statusIconSize};
  position: relative;
  left: 8px;

  [dir="rtl"] & {
    left: unset;
    right: 8px;
  }

  ${({ done }) => done && `
    color: ${colorSuccess};
  `}

  ${({ error }) => error && `
    color: ${colorDanger};
  `}

  ${({ loading }) => loading && css`
    color: ${colorGrayLightest};
    border: 1px solid;
    border-radius: 50%;
    border-right-color: ${colorGray};
    animation: ${rotate} 1s linear infinite;
  `}
`;

const FileLine = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: ${fileLineWidth};
  padding-bottom: ${iconPaddingMd};
`;

const ToastFileName = styled.span`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin-left: ${mdPaddingY};
  width: auto;
  text-align: left;
  font-weight: ${headingsFontWeight};

  [dir="rtl"] & {
    margin-right: ${mdPaddingY};
    margin-left: 0;
    text-align: right;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Status = styled.span`
  font-size: 70%;
`;

export default {
  ToastIcon,
  FileLine,
  ToastFileName,
  Content,
  Status,
};
