import styled from 'styled-components';
import Dropzone from 'react-dropzone';
import Button from '/imports/ui/components/common/button/component';
import BackupIcon from '@mui/icons-material/BackupOutlined';
import {
  lgPaddingX,
  borderRadius,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeSmaller,
  textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import {
  colorGrayLight,
  colorPrimary,
  colorDanger,
  colorLink,
  colorGrayLighter,
  colorText,
  colorOffWhite,
  colorGrayUserListToolbar,
  appsPanelTextColor,
} from '/imports/ui/stylesheets/styled-components/palette';

const UploadIcon = styled(BackupIcon)`
  color: ${colorPrimary};
  font-size: 2rem !important;
`;

const RemoveButton = styled(Button)`
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
  display: flex;
  margin: 0 1.5rem;
  padding: 0.5rem 1.5rem;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex: 0 0 auto;
  border-radius: 0.5rem;
  border: 1px dashed ${colorPrimary};
  cursor: pointer;

  & + & {
    margin-top: 0.5rem;
  }

  &.dropzoneActive {
    background-color: ${colorGrayUserListToolbar};
  }
`;

const DropzoneMessage = styled.p`
  color: ${appsPanelTextColor};
  font-weight: ${textFontWeight};
  flex: 1 0 0;
`;

const DropzoneLink = styled.span`
  color: ${colorLink};
  text-decoration: underline;
`;

const ExtraHint = styled.div`
  margin: 1rem 1.5rem 0;
  font-weight: bold;
`;

const ExternalUpload = styled.div`
  background-color: ${colorOffWhite};
  border-radius: ${borderRadius};
  margin: 1rem;
  padding: ${lgPaddingX};
  color: ${colorText};
  font-weight: normal;
  display: flex;
  justify-content: space-between;
  flex-direction: row;

  & p {
    margin: 0;
  }
`;

const ExternalUploadTitle = styled.h4`
  font-size: 0.9rem;
  margin: 0;
`;

const ExternalUploadButton = styled(Button)`
  height: 2rem;
  align-self: center;
  margin-left: 2rem;
`;

// The uploader is a column that fits the media sharing modal: the upload areas
// and the share button keep their height, and the list takes what is left.
const UploadModal = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
`;

// A grid that wraps and scrolls vertically, so every presentation can be
// reached on a narrow screen and the share button stays in view.
const PresentationsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  align-content: start;
  padding-top: 1.5rem;
  padding-right: 1.5rem;
  padding-bottom: 0.5rem;
  padding-left: 1.5rem;
  gap: 1rem;
  flex: 1 1 auto;
  min-height: 9rem;
  overflow-x: hidden;
  overflow-y: auto;
`;

const PresentationItemContainer = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
`;

const PresentationThumbnail = styled.button`
  background: none;
  padding: 0;
  margin: 0;
  width: 100%;
  /* Every thumbnail gets the same frame, so a portrait page fits inside it
     instead of making its row several times taller than the others. */
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 0.5rem;
  overflow: hidden; // Ensures image respects border-radius
  border: 0.5px solid ${colorGrayLighter};

  &:hover,
  &:focus {
    outline: none;
    border: 2px solid ${colorPrimary};
  }

  ${({ selected }) => selected && `
    border: 2px solid ${colorPrimary};
  `}

  img {
    max-width: 100%;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block; // Remove extra space below image
  }
`;

const PresentationItemBottomContainer = styled.div`
  display: inline-flex;
  align-items: center;
  width: 100%;
  margin-top: auto;
`;

const PresentationItemName = styled.div`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  text-align: left;
  flex: 1 0 0;
  overflow: hidden;
  color: ${appsPanelTextColor};
  text-overflow: ellipsis;
  font-size: ${fontSizeSmaller};
  font-weight: ${textFontWeight};
`;

export default {
  UploadModal,
  PresentationsContainer,
  PresentationItemContainer,
  PresentationThumbnail,
  PresentationItemBottomContainer,
  PresentationItemName,
  UploadIcon,
  RemoveButton,
  UploaderDropzone,
  DropzoneMessage,
  DropzoneLink,
  ExtraHint,
  ExternalUpload,
  ExternalUploadTitle,
  ExternalUploadButton,
};
