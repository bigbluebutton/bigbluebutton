import styled, { css, keyframes } from 'styled-components';
import Icon from '/imports/ui/components/common/icon/component';
import {
  fileLineWidth,
  iconPaddingMd,
  borderSizeLarge,
  statusIconSize,
  toastMdMargin,
  uploadListHeight,
  smPaddingX,
  mdPaddingY,
  statusInfoHeight,
  uploadIconSize,
  iconLineHeight,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorDanger,
  colorGray,
  colorGrayLightestText,
  colorPrimary,
  colorSuccess,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import ToastStyles from '/imports/ui/components/common/toast/styles';

const rotate = keyframes`
  0% { transform: rotate(0); }
  100% { transform: rotate(360deg); }
`;

const UploadRow = styled.div`
  display: flex;
  flex-direction: column;
`;

const FileLine = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-bottom: ${iconPaddingMd};
  width: ${fileLineWidth};
`;

const ToastFileName = styled(ToastStyles.ToastMessage)`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin-left: ${mdPaddingY};
  height: 1rem;
  width: auto;
  text-align: left;

  [dir="rtl"] & {
    margin-right: ${mdPaddingY};
    margin-left: 0;
    text-align: right;
  }
`;

const StatusIcon = styled.span`
  & > i {
    height: ${statusIconSize};
    width: ${statusIconSize};
  }
`;

const StatusInfo = styled.div`
  padding: 0;
  bottom: ${toastMdMargin};
  position: relative;
  left: ${borderSizeLarge};
  
  [dir="rtl"] & {
    right: ${borderSizeLarge};
    left: 0;
  }
`;

const ToastWrapper = styled.div`
  max-height: 50%;
  width: ${fileLineWidth};
`;

const UploadToastHeader = styled.div`
  position: relative;
  margin-bottom: ${toastMdMargin};
  padding-bottom: ${smPaddingX};
`;

const UploadIcon = styled(Icon)`
  background-color: ${colorPrimary};
  color: ${colorWhite};
  height: ${uploadIconSize};
  width: ${uploadIconSize};
  border-radius: 50%;
  font-size: 135%;
  line-height: ${iconLineHeight};
  margin-right: ${smPaddingX};

  [dir="rtl"] & {
    margin-left: ${smPaddingX};
    margin-right: 0;
  }
`;

const UploadToastTitle = styled.span`
  position: fixed;
  font-weight: 600;
  margin-top: ${toastMdMargin};
`;

const InnerToast = styled(ScrollboxVertical)`
  position: relative;
  width: 100%;
  height: 100%;
  max-height: ${uploadListHeight};
  overflow-y: auto;
  padding-right: 1.5rem;
  box-sizing: content-box;
  background: none;

  [dir="rtl"] & {
    padding-right: 0;
    padding-left: 1.5rem;
  }
`;

const ToastItemIcon = styled(Icon)<{
  done?: boolean;
  error?: boolean;
  loading?: boolean;
  color?: string;
}>`
  position: relative;
  width: ${statusIconSize};
  height: ${statusIconSize};
  font-size: 117%;
  left: ${statusInfoHeight};

  [dir="rtl"] & {
    left: unset;
    right: ${statusInfoHeight};
  }

  ${({ done }) => done && `
    color: ${colorSuccess};
  `}

  ${({ error }) => error && `
    color: ${colorDanger};
  `}

  ${({ loading, color }) => loading && css`
    color: ${colorGrayLightestText};
    border: 1px solid;
    border-radius: 50%;
    border-right-color: ${color || colorGray};
    animation: ${rotate} 1s linear infinite;
  `}
`;

const StatusInfoSpan = styled.span<{ styles?: string }>`
  font-size: 70%;

  ${({ styles }) => styles === 'error' && `
    display: inline-block;
    color: ${colorDanger};
  `}
`;

export default {
  UploadRow,
  FileLine,
  ToastFileName,
  StatusIcon,
  StatusInfo,
  ToastWrapper,
  UploadToastHeader,
  UploadIcon,
  UploadToastTitle,
  InnerToast,
  ToastItemIcon,
  StatusInfoSpan,
};
