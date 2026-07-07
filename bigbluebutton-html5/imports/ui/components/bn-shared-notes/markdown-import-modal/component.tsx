import * as React from 'react';
import { defineMessages, useIntl } from 'react-intl';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BlockNoteEditor } from '@blocknote/core';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import Button from '/imports/ui/components/common/button/component';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';

// A Markdown file larger than this is rejected before it is read into memory.
const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ACCEPTED_EXTENSIONS = ['.md', '.markdown'];

type ImportError = 'invalidType' | 'tooLarge' | 'readFailed' | 'empty';

const intlMessages = defineMessages({
  title: {
    id: 'app.notes.importModal.title',
    description: 'Title for the import from markdown modal',
  },
  placeholder: {
    id: 'app.notes.importModal.placeholder',
    description: 'Placeholder for the markdown import textarea',
  },
  replaceWarning: {
    id: 'app.notes.importModal.replaceWarning',
    description: 'Warning shown before replacing existing notes',
  },
  importLabel: {
    id: 'app.notes.importModal.import',
    description: 'Label for the import confirmation button',
  },
  cancelLabel: {
    id: 'app.notes.importModal.cancel',
    description: 'Label for the cancel button',
  },
  dropzoneLabel: {
    id: 'app.notes.importModal.dropzone.label',
    description: 'Instruction to drag and drop a markdown file',
  },
  dropzoneBrowse: {
    id: 'app.notes.importModal.dropzone.browse',
    description: 'Call to action to open the file browser',
  },
  dropzoneHint: {
    id: 'app.notes.importModal.dropzone.hint',
    description: 'Hint listing the accepted file extensions',
  },
  dropzoneActive: {
    id: 'app.notes.importModal.dropzone.active',
    description: 'Shown while a file is being dragged over the dropzone',
  },
  orDivider: {
    id: 'app.notes.importModal.orDivider',
    description: 'Divider between the dropzone and the paste textarea',
  },
  removeFile: {
    id: 'app.notes.importModal.fileLoaded.remove',
    description: 'Label for the button that removes the loaded file',
  },
  errorInvalidType: {
    id: 'app.notes.importModal.error.invalidType',
    description: 'Error shown when a non-markdown file is selected',
  },
  errorTooLarge: {
    id: 'app.notes.importModal.error.tooLarge',
    description: 'Error shown when the selected file exceeds the size limit',
  },
  errorReadFailed: {
    id: 'app.notes.importModal.error.readFailed',
    description: 'Error shown when the file could not be read',
  },
  errorEmpty: {
    id: 'app.notes.importModal.error.empty',
    description: 'Message shown when the selected file has no content',
  },
});

const errorMessageIds: Record<ImportError, keyof typeof intlMessages> = {
  invalidType: 'errorInvalidType',
  tooLarge: 'errorTooLarge',
  readFailed: 'errorReadFailed',
  empty: 'errorEmpty',
};

// Human readable file size for the loaded-file chip.
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface MarkdownImportModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: BlockNoteEditor<any, any, any>;
  onClose: () => void;
}

const MarkdownImportModal: React.FC<MarkdownImportModalProps> = ({ editor, onClose }) => {
  const intl = useIntl();
  // `markdown` is the single source of truth fed to the parse pipeline, whether it
  // came from an uploaded file or from the textarea below.
  const [markdown, setMarkdown] = React.useState('');
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [fileSize, setFileSize] = React.useState<number | null>(null);
  const [error, setError] = React.useState<ImportError | null>(null);
  const [confirming, setConfirming] = React.useState(false);

  const clearFile = React.useCallback(() => {
    setFileName(null);
    setFileSize(null);
  }, []);

  const loadFile = React.useCallback((file: File) => {
    const name = file.name.toLowerCase();
    const isMarkdown = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
    // Error paths never touch `markdown`: text the user may have typed in the textarea
    // must survive a rejected drop. Only the chip (file metadata) is cleared.
    if (!isMarkdown) {
      setError('invalidType');
      clearFile();
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('tooLarge');
      clearFile();
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setError('readFailed');
      clearFile();
    };
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setFileName(file.name);
      setFileSize(file.size);
      setMarkdown(text);
      // Empty file: keep the chip so the user sees what they loaded, but flag it and
      // leave the import button disabled (markdown is empty).
      setError(text.trim().length === 0 ? 'empty' : null);
    };
    reader.readAsText(file);
  }, [clearFile]);

  // react-dropzone (the legacy version this repo pins, as used by the presentation
  // uploader) hands onDrop both the accepted and the rejected files. `accept` only
  // hints the native file picker to default to .md/.markdown; it is not authoritative.
  // A file that fails the hint lands in rejectedFiles, so it is still forwarded to
  // loadFile, which is the source of truth for the extension check and the error.
  const onDrop = (acceptedFiles: File[], rejectedFiles: File[]) => {
    const file = acceptedFiles[0] ?? rejectedFiles?.[0];
    if (file) loadFile(file);
  };

  const documentHasContent = (): boolean => editor.blocksToMarkdownLossy(editor.document).trim().length > 0;

  const applyImport = async () => {
    // On the client BlockNote editor this is synchronous, but await keeps it correct
    // if a future version returns a Promise.
    const blocks = await editor.tryParseMarkdownToBlocks(markdown);
    // Replacing every current top-level block mutates the shared Yjs fragment, so the
    // change propagates through Hocuspocus to every connected client.
    editor.replaceBlocks(editor.document, blocks);
    onClose();
  };

  const handleImportClick = () => {
    // Non-empty document: require an explicit confirmation before overwriting.
    if (documentHasContent() && !confirming) {
      setConfirming(true);
      return;
    }
    applyImport();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    // Typing supersedes any file-load error/message (e.g. filling in an empty file).
    setError(null);
  };

  const handleRemoveFile = () => {
    clearFile();
    setMarkdown('');
    setError(null);
  };

  // The red dashed border only applies to hard errors, not the empty-file notice.
  const hasHardError = error !== null && error !== 'empty';

  return (
    <ModalSimple
      title={intl.formatMessage(intlMessages.title)}
      modalIsOpen
      onRequestClose={onClose}
      hideBorder
      data-test="notesImportMarkdownModal"
    >
      <Styled.Container>
        <Styled.Dropzone
          multiple={false}
          accept={ACCEPTED_EXTENSIONS}
          activeClassName="isDragActive"
          onDrop={onDrop}
          inputProps={{
            'aria-label': intl.formatMessage(intlMessages.dropzoneLabel),
            'data-test': 'notesImportMarkdownFileInput',
          }}
          $hasError={hasHardError}
          data-test="notesImportMarkdownDropzone"
        >
          {({ isDragActive }: { isDragActive: boolean }) => (
            <>
              <Styled.DropzoneIcon iconName="upload" />
              {isDragActive ? (
                <Styled.DropzoneLabel>
                  {intl.formatMessage(intlMessages.dropzoneActive)}
                </Styled.DropzoneLabel>
              ) : (
                <Styled.DropzoneLabel>
                  {intl.formatMessage(intlMessages.dropzoneLabel)}
                  {' '}
                  <Styled.Browse>{intl.formatMessage(intlMessages.dropzoneBrowse)}</Styled.Browse>
                </Styled.DropzoneLabel>
              )}
              <Styled.DropzoneHint>
                {intl.formatMessage(intlMessages.dropzoneHint)}
              </Styled.DropzoneHint>
            </>
          )}
        </Styled.Dropzone>

        {fileName && (
          <Styled.FileChip data-test="notesImportMarkdownFileLoaded">
            <Icon iconName="file" />
            <Styled.FileName>{fileName}</Styled.FileName>
            {fileSize !== null && <Styled.FileSize>{formatBytes(fileSize)}</Styled.FileSize>}
            <Styled.FileRemove
              type="button"
              onClick={handleRemoveFile}
              aria-label={intl.formatMessage(intlMessages.removeFile)}
              data-test="notesImportMarkdownFileRemove"
            >
              <Icon iconName="close" />
            </Styled.FileRemove>
          </Styled.FileChip>
        )}

        {error && (
          <Styled.Error role="alert" data-test="notesImportMarkdownError">
            {intl.formatMessage(intlMessages[errorMessageIds[error]])}
          </Styled.Error>
        )}

        <Styled.Divider>{intl.formatMessage(intlMessages.orDivider)}</Styled.Divider>

        <Styled.Textarea
          data-test="notesImportMarkdownTextarea"
          aria-label={intl.formatMessage(intlMessages.placeholder)}
          placeholder={intl.formatMessage(intlMessages.placeholder)}
          value={markdown}
          onChange={handleTextareaChange}
        />
        {confirming && (
          <Styled.Warning data-test="notesImportMarkdownWarning">
            {intl.formatMessage(intlMessages.replaceWarning)}
          </Styled.Warning>
        )}
        <Styled.Actions>
          <Button
            label={intl.formatMessage(intlMessages.cancelLabel)}
            onClick={onClose}
            color="default"
            size="sm"
            dataTest="notesImportMarkdownCancel"
          />
          <Button
            label={intl.formatMessage(intlMessages.importLabel)}
            onClick={handleImportClick}
            color="primary"
            size="sm"
            disabled={markdown.trim().length === 0}
            dataTest="notesImportMarkdownConfirm"
          />
        </Styled.Actions>
      </Styled.Container>
    </ModalSimple>
  );
};

export default MarkdownImportModal;
