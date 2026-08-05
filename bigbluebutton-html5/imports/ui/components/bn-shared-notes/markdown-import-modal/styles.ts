import styled from 'styled-components';
// eslint-disable-next-line import/no-extraneous-dependencies
import Dropzone from 'react-dropzone';
import Icon from '/imports/ui/components/common/icon/component';
import {
  colorGray,
  colorGrayLight,
  colorGrayLighter,
  colorGrayLightest,
  colorDanger,
  colorPrimary,
  colorOffWhite,
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 20rem;
`;

interface DropzoneProps {
  $hasError: boolean;
}

// Primary import path: the same react-dropzone target the presentation uploader uses.
// The `.isDragActive` class is applied by Dropzone via the activeClassName prop.
// Compact padding keeps the stacked layout tight next to the optional textarea below.
const DropzoneRoot = styled(Dropzone)<DropzoneProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.75rem;
  text-align: center;
  cursor: pointer;
  border: 2px dashed ${colorGrayLighter};
  border-radius: 0.25rem;
  color: ${colorGray};
  transition: border-color 0.15s ease, background-color 0.15s ease;

  &:hover,
  &:focus-within {
    border-color: ${colorPrimary};
  }

  &.isDragActive {
    border-color: ${colorPrimary};
    background-color: rgba(15, 112, 215, 0.08);
  }

  ${({ $hasError }) => $hasError && `
    border-color: ${colorDanger};
  `}
`;

const DropzoneIcon = styled(Icon)`
  font-size: 1.5rem;
  line-height: 1;
  color: ${colorGrayLight};
`;

const DropzoneLabel = styled.span`
  font-size: 0.875rem;
`;

const Browse = styled.span`
  color: ${colorPrimary};
  text-decoration: underline;
`;

const DropzoneHint = styled.span`
  font-size: 0.75rem;
  color: ${colorGrayLight};
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${colorGrayLight};
  font-size: 0.75rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${colorGrayLightest};
  }
`;

const FileChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: ${colorOffWhite};
  border: 1px solid ${colorGrayLightest};
  border-radius: 0.25rem;
  font-size: 0.875rem;
`;

const FileName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
`;

const FileSize = styled.span`
  color: ${colorGrayLight};
  font-size: 0.75rem;
  white-space: nowrap;
`;

const FileRemove = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  color: ${colorGray};

  &:hover {
    color: ${colorDanger};
  }

  &:focus-visible {
    outline: 2px solid ${colorPrimary};
  }
`;

const ErrorText = styled.p`
  margin: 0;
  color: ${colorDanger};
  font-size: 0.8125rem;
  font-weight: 600;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 8rem;
  resize: vertical;
  padding: 0.5rem;
  border: 1px solid ${colorGrayLighter};
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875rem;
`;

// Append/Replace selector. Native radio inputs styled with the palette, matching
// the self-contained styled-components approach the rest of this modal uses.
const ModeGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ModeLegend = styled.span`
  color: ${colorGray};
  font-size: 0.8125rem;
  font-weight: 600;
`;

const ModeOption = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;

  & > input[type='radio'] {
    margin-top: 0.2rem;
    accent-color: ${colorPrimary};
    cursor: pointer;
  }
`;

const ModeText = styled.span`
  display: flex;
  flex-direction: column;
  line-height: 1.2;
`;

const ModeOptionLabel = styled.span`
  color: ${colorText};
  font-size: 0.875rem;
  font-weight: 600;
`;

const ModeOptionDescription = styled.span`
  color: ${colorGrayLight};
  font-size: 0.75rem;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

export default {
  Container,
  Dropzone: DropzoneRoot,
  DropzoneIcon,
  DropzoneLabel,
  Browse,
  DropzoneHint,
  Divider,
  FileChip,
  FileName,
  FileSize,
  FileRemove,
  ErrorText,
  Textarea,
  ModeGroup,
  ModeLegend,
  ModeOption,
  ModeText,
  ModeOptionLabel,
  ModeOptionDescription,
  Actions,
};
