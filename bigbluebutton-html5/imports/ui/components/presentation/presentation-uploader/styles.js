import styled, { css, keyframes } from 'styled-components';
import Icon from '/imports/ui/components/common/icon/component';
import Dropzone from 'react-dropzone';
import Button from '/imports/ui/components/common/button/component';
import {
  fileLineWidth,
  iconPaddingMd,
  borderSizeLarge,
  lgPaddingX,
  statusIconSize,
  toastMdMargin,
  uploadListHeight,
  smPaddingX,
  smPaddingY,
  borderSize,
  borderRadius,
  lgPaddingY,
  mdPaddingY,
  modalInnerWidth,
  statusInfoHeight,
  itemActionsWidth,
  uploadIconSize,
  iconLineHeight,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  headingsFontWeight,
  fontSizeLarge,
  modalTitleFw,
} from '/imports/ui/stylesheets/styled-components/typography';
import {
  colorGrayLight,
  colorGrayDark,
  colorPrimary,
  colorWhite,
  colorDanger,
  colorGray,
  colorGrayLighter,
  colorLink,
  colorSuccess,
  colorGrayLightest,
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';

const barStripes = keyframes`
  from { background-position: 1rem 0; }
  to { background-position: 0 0; }
`;
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

const ToastFileName = styled.span`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  height: 1.25rem !important;
  margin-left: ${mdPaddingY};
  height: 1rem;
  width: auto;
  text-align: left;
  font-weight: ${headingsFontWeight};

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

const FileList = styled(ScrollboxVertical)`
  height: 100%;
  max-height: ${uploadListHeight};
  padding: 1px;
  margin-bottom: 2rem;
  overflow-x: hidden;
`;

const Table = styled.table`
  position: relative;
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;

  & > tbody {
    text-align: left;

    [dir="rtl"] & {
      text-align: right;
    }

    > tr {
      border-bottom: 1px solid ${colorGrayLight};

      &:last-child {
        border-bottom: 0;
      }

      &:hover,
      &:focus {
        background-color: transparentize(#8B9AA8, .85);
      }

      th,
      td {
        padding: calc(${smPaddingY} * 2) calc(${smPaddingX} / 2);
        white-space: nowrap;
      }

      th {
        font-weight: bold;
        color: ${colorGrayDark};
      }
    }
  }
`;

const VisuallyHidden = styled.th`
  position: absolute;
  overflow: hidden;
  clip: rect(0 0 0 0);
  height: 1px; width: 1px;
  margin: -1px; padding: 0; border: 0;
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

const TableItemIcon = styled.td`
  width: 1%;

  & > i {
  font-size: 1.35rem;
  }
`;

const TableItemCurrent = styled.th`
  width: 1%;

  padding-left: 0;
  padding-right: inherit;

  [dir="rtl"] & {
    padding-left: inherit;
    padding-right: 0;
  }
`;

const CurrentLabel = styled.span`
  display: inline;
  padding: .25em .5em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  color: ${colorWhite};
  background: ${colorPrimary};
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: .25em;
  text-transform: uppercase;
`;

const TableItemName = styled.th`
  height: 1rem;
  width: auto;
  position: relative;

  &:before {
    content: "\\00a0";
    visibility: hidden;
  }

  & > span {
    min-width: 0;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    position: absolute;
    left: 0;
    right: 0;

    [dir="rtl"] & {
      right: 1rem;
    }
  }
`;

const TableItemStatus = styled.td`
  width: 1%;

  text-align: right;

  [dir="rtl"] & {
    text-align: left;
  }
`;

const ItemAction = styled.div`
  margin-left: ${smPaddingX};
  &, & i {
    margin-top: .25rem;
    display: inline-block;
    border: 0;
    background: transparent;
    cursor: pointer;
    font-size: 1.35rem;
    color: ${colorGrayLight};
    padding: 0;
    ${({ animations }) => animations && `
      transition: all .25s;
    `}
    :hover, :focus {
      padding: unset !important;
    }
  }
`; 

const RemoveButton = styled(Button)`
  margin-left: ${smPaddingX};
  div > i {
    margin-top: .25rem;
  }

  &,
  & > i {
    display: inline-block;
    border: 0;
    background: transparent;
    cursor: pointer;
    font-size: 1.35rem;
    color: ${colorGrayLight};
    padding: 0;

    ${({ animations }) => animations && `
      transition: all .25s;
    `}

    :hover, :focus {
      padding: unset !important;
    }
  }

  background-color: transparent;
  border: 0 !important;

  & > i:focus,
  & > i:hover {
    color: ${colorDanger} !important;
  }

  &[aria-disabled="true"] {
    cursor: not-allowed;
    opacity: .5;
    box-shadow: none;
    pointer-events: none;
  }
`;

const UploaderDropzone = styled(Dropzone)`
  flex: auto;
  border: ${borderSize} dashed ${colorGray};
  color: ${colorGray};
  border-radius: ${borderRadius};
  padding: calc(${lgPaddingY} * 2.5) ${lgPaddingX};
  text-align: center;
  font-size: ${fontSizeLarge};
  cursor: pointer;

  & .dropzoneActive {
    background-color: ${colorGrayLighter};
  }
`;

const DropzoneIcon = styled(Icon)`
  font-size: calc(${fontSizeLarge} * 3);
`;

const DropzoneMessage = styled.p`
  margin: ${mdPaddingY} 0;
`;

const DropzoneLink = styled.span`
  color: ${colorLink};
  text-decoration: underline;
  font-size: 80%;
  display: block;
`;

const UploaderModal = styled.div`
  background-color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1300;
`;

const ModalInner = styled.div`
  margin-left: auto;
  margin-right: auto;
  width: ${modalInnerWidth};
  max-height: 100%;
  max-width: 100%;
  padding-bottom: .75rem;
  overflow-y: auto;
  
  @media ${smallOnly} {
    padding-left: ${statusInfoHeight};
    padding-right: ${statusInfoHeight};
  }
`;

const ModalHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom:${borderSize} solid ${colorGrayLighter};
  margin-bottom: 2rem;

  h1 {
    font-weight: ${modalTitleFw};
  }

  div {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
`;

const ActionWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0.25rem;
`;

const DismissButton = styled(Button)`
  min-width: 6rem;
  height: 1.875rem;
  margin-right: ${toastMdMargin};
`;

const ConfirmButton = styled(Button)`
  min-width: 6rem;
  height: 1.875rem;
`;

const ModalHint = styled.div`
  margin-bottom: 2rem;
  color: ${colorText};
  font-weight: normal;
`;

const ToastItemIcon = styled(Icon)`
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

  ${({ loading }) => loading && css`
    color: ${colorGrayLightest};
    border: 1px solid;
    border-radius: 50%;
    border-right-color: ${colorGray};
    animation: ${rotate} 1s linear infinite;
  `}
`;

const StatusInfoSpan = styled.span`
  font-size: 70%;

  ${({ styles }) => styles === 'error' && `
    display: inline-block;
    color: ${colorDanger};
  `}
`;

const PresentationItem = styled.tr`
  ${({ isNew }) => isNew && `
    background-color: rgba(0, 128, 129, 0.05);
  `}

  ${({ uploading }) => uploading && `
    background-color: rgba(0, 128, 129, 0.25);
  `}

  ${({ converting }) => converting && `
    background-color: rgba(0, 128, 129, 0.25);
  `}

  ${({ error }) => error && `
    background-color: rgba(223, 39, 33, 0.25);
  `}

  ${({ animated }) => animated && `
    background-image: linear-gradient(45deg,
    rgba(255, 255, 255, .15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, .15) 50%,
    rgba(255, 255, 255, .15) 75%,
    transparent 75%,
    transparent
    );
    background-size: 1rem 1rem;

    ${({ animations }) => animations && css`
      animation: ${barStripes} 1s linear infinite;
    `}
    }
  `}
`;

const TableItemActions = styled.td`
  width: 1%;
  min-width: ${itemActionsWidth};
  text-align: left;

  [dir="rtl"] & {
    text-align: right;
  }

  ${({ notDownloadable }) => notDownloadable && `
    min-width: 48px;
  `}
`;

const DownloadButton = styled(Button)`
  margin-left: ${smPaddingX};
  div > i {
    margin-top: .25rem;
  }

  &,
  & > i {
    display: inline-block;
    border: 0;
    background: transparent;
    cursor: pointer;
    font-size: 1.35rem;
    color: ${colorGrayLight};
    padding: 0;

    ${({ animations }) => animations && `
      transition: all .25s;
    `}

    :hover, :focus {
      padding: unset !important;
    }
  }

  background-color: transparent;
  border: 0 !important;

  & > i:focus,
  & > i:hover {
    color: ${colorDanger} !important;
  }

  &[aria-disabled="true"] {
    cursor: not-allowed;
    opacity: .5;
    box-shadow: none;
    pointer-events: none;
  }

  ${({ isDownloadable }) => isDownloadable && `
    & > i {
      color: ${colorSuccess};
    }
  `}
`;

const ExtraHint = styled.div`
  margin-top: 1rem;
  font-weight: bold;
`;

export default {
  UploadRow,
  FileLine,
  ToastFileName,
  StatusIcon,
  StatusInfo,
  FileList,
  Table,
  VisuallyHidden,
  ToastWrapper,
  UploadToastHeader,
  UploadIcon,
  UploadToastTitle,
  InnerToast,
  TableItemIcon,
  TableItemCurrent,
  CurrentLabel,
  TableItemName,
  TableItemStatus,
  ItemAction,
  RemoveButton,
  UploaderDropzone,
  DropzoneIcon,
  DropzoneMessage,
  DropzoneLink,
  UploaderModal,
  ModalInner,
  ModalHeader,
  ActionWrapper,
  DismissButton,
  ConfirmButton,
  ModalHint,
  ToastItemIcon,
  StatusInfoSpan,
  PresentationItem,
  TableItemActions,
  DownloadButton,
  ExtraHint,
};
