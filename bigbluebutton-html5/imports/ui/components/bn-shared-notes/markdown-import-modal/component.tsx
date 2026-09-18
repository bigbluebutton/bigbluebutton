import * as React from 'react';
import { defineMessages, useIntl } from 'react-intl';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BlockNoteEditor } from '@blocknote/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { DropzoneRenderFunction } from 'react-dropzone';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import Button from '/imports/ui/components/common/button/component';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';

// A Markdown file larger than this is rejected before it is read into memory.
const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ACCEPTED_EXTENSIONS = ['.md', '.markdown'];
// Comma-separated form for the native file picker's `accept` attribute (react-dropzone
// types it as a single string). The array above stays the source of truth for the
// authoritative extension check in loadFile.
const ACCEPTED_EXTENSIONS_ATTR = ACCEPTED_EXTENSIONS.join(',');

// data-test is a valid DOM data-* attribute but not part of the typed
// InputHTMLAttributes. Spreading it from a named object lets it through the
// dropzone inputProps without a type cast.
const FILE_INPUT_PROPS = { 'data-test': 'notesImportMarkdownFileInput' };

type ImportError = 'invalidType' | 'tooLarge' | 'readFailed' | 'empty' | 'parseFailed';

// How the parsed markdown is written into the current notes. `append` (the default)
// adds it after the existing content; `replace` overwrites the whole document.
type ImportMode = 'append' | 'replace';

const intlMessages = defineMessages({
  title: {
    id: 'app.notes.importModal.title',
    description: 'Title for the import from markdown modal',
  },
  placeholder: {
    id: 'app.notes.importModal.placeholder',
    description: 'Placeholder for the markdown import textarea',
  },
  importModeLabel: {
    id: 'app.notes.importModal.importMode.label',
    description: 'Label for the append/replace import mode selector',
  },
  importModeAppendLabel: {
    id: 'app.notes.importModal.importMode.append.label',
    description: 'Label for the append import mode option',
  },
  importModeAppendDescription: {
    id: 'app.notes.importModal.importMode.append.description',
    description: 'Description of the append import mode option',
  },
  importModeReplaceLabel: {
    id: 'app.notes.importModal.importMode.replace.label',
    description: 'Label for the replace import mode option',
  },
  importModeReplaceDescription: {
    id: 'app.notes.importModal.importMode.replace.description',
    description: 'Description of the replace import mode option',
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
  errorParseFailed: {
    id: 'app.notes.importModal.error.parseFailed',
    description: 'Error shown when the markdown could not be parsed into blocks',
  },
});

const errorMessageIds: Record<ImportError, keyof typeof intlMessages> = {
  invalidType: 'errorInvalidType',
  tooLarge: 'errorTooLarge',
  readFailed: 'errorReadFailed',
  empty: 'errorEmpty',
  parseFailed: 'errorParseFailed',
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
  // Default to `append` so importing never silently destroys existing notes.
  const [importMode, setImportMode] = React.useState<ImportMode>('append');

  const clearFile = React.useCallback(() => {
    setFileName(null);
    setFileSize(null);
  }, []);

  const loadFile = React.useCallback(async (file: File) => {
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

    try {
      const text = await file.text();
      setFileName(file.name);
      setFileSize(file.size);
      setMarkdown(text);
      // Empty file: keep the chip so the user sees what they loaded, but flag it and
      // leave the import button disabled (markdown is empty).
      setError(text.trim().length === 0 ? 'empty' : null);
    } catch {
      setError('readFailed');
      clearFile();
    }
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

  const applyImport = async () => {
    try {
      // On the client BlockNote editor this is synchronous, but await keeps it correct
      // if a future version returns a Promise.
      const blocks = await editor.tryParseMarkdownToBlocks(markdown);
      // Both paths mutate the shared Yjs fragment, so the change propagates through
      // Hocuspocus to every connected client.
      if (importMode === 'replace') {
        editor.replaceBlocks(editor.document, blocks);
      } else {
        // Append: insert the parsed blocks right after the last existing block. The
        // document always has at least one (trailing) block to anchor to.
        const lastBlock = editor.document[editor.document.length - 1];
        editor.insertBlocks(blocks, lastBlock, 'after');
      }
      onClose();
    } catch (e) {
      // Malformed markdown (or a parser edge case) rejects the parse promise. Surface
      // the error and keep the modal open so the user can fix the syntax and retry,
      // instead of the modal silently freezing.
      // eslint-disable-next-line no-console
      console.error('Markdown import failed', e);
      setError('parseFailed');
    }
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

  // react-dropzone's legacy render-prop children. Typed via DropzoneRenderFunction so
  // isDragActive is a plain local (destructured in the body, not an inline param type
  // that react/no-unused-prop-types misreads as a component's declared props).
  const renderDropzoneContent: DropzoneRenderFunction = (renderProps) => {
    const { isDragActive } = renderProps;
    return (
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
    );
  };

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
          accept={ACCEPTED_EXTENSIONS_ATTR}
          activeClassName="isDragActive"
          onDrop={onDrop}
          inputProps={{
            'aria-label': intl.formatMessage(intlMessages.dropzoneLabel),
            ...FILE_INPUT_PROPS,
          }}
          $hasError={hasHardError}
          data-test="notesImportMarkdownDropzone"
        >
          {/* styled(Dropzone) merges the div's ReactNode children with dropzone's
              render-function children into an intersection that excludes functions, so
              the valid render-prop is passed through React.ReactNode. */}
          {renderDropzoneContent as unknown as React.ReactNode}
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
          <Styled.ErrorText role="alert" data-test="notesImportMarkdownError">
            {intl.formatMessage(intlMessages[errorMessageIds[error]])}
          </Styled.ErrorText>
        )}

        <Styled.Divider>{intl.formatMessage(intlMessages.orDivider)}</Styled.Divider>

        <Styled.Textarea
          data-test="notesImportMarkdownTextarea"
          aria-label={intl.formatMessage(intlMessages.placeholder)}
          placeholder={intl.formatMessage(intlMessages.placeholder)}
          value={markdown}
          onChange={handleTextareaChange}
        />
        <Styled.ModeGroup
          role="radiogroup"
          aria-label={intl.formatMessage(intlMessages.importModeLabel)}
          data-test="notesImportMarkdownModeGroup"
        >
          <Styled.ModeLegend>{intl.formatMessage(intlMessages.importModeLabel)}</Styled.ModeLegend>
          <Styled.ModeOption>
            <input
              type="radio"
              name="notesImportMarkdownMode"
              value="append"
              checked={importMode === 'append'}
              onChange={() => setImportMode('append')}
              data-test="notesImportMarkdownAppendMode"
            />
            <Styled.ModeText>
              <Styled.ModeOptionLabel>
                {intl.formatMessage(intlMessages.importModeAppendLabel)}
              </Styled.ModeOptionLabel>
              <Styled.ModeOptionDescription>
                {intl.formatMessage(intlMessages.importModeAppendDescription)}
              </Styled.ModeOptionDescription>
            </Styled.ModeText>
          </Styled.ModeOption>
          <Styled.ModeOption>
            <input
              type="radio"
              name="notesImportMarkdownMode"
              value="replace"
              checked={importMode === 'replace'}
              onChange={() => setImportMode('replace')}
              data-test="notesImportMarkdownReplaceMode"
            />
            <Styled.ModeText>
              <Styled.ModeOptionLabel>
                {intl.formatMessage(intlMessages.importModeReplaceLabel)}
              </Styled.ModeOptionLabel>
              <Styled.ModeOptionDescription>
                {intl.formatMessage(intlMessages.importModeReplaceDescription)}
              </Styled.ModeOptionDescription>
            </Styled.ModeText>
          </Styled.ModeOption>
        </Styled.ModeGroup>
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
            onClick={applyImport}
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
