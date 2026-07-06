import * as React from 'react';
import { defineMessages, useIntl } from 'react-intl';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BlockNoteEditor } from '@blocknote/core';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import Button from '/imports/ui/components/common/button/component';
import Styled from './styles';

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
});

interface MarkdownImportModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: BlockNoteEditor<any, any, any>;
  onClose: () => void;
}

const MarkdownImportModal: React.FC<MarkdownImportModalProps> = ({ editor, onClose }) => {
  const intl = useIntl();
  const [markdown, setMarkdown] = React.useState('');
  const [confirming, setConfirming] = React.useState(false);

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

  return (
    <ModalSimple
      title={intl.formatMessage(intlMessages.title)}
      modalIsOpen
      onRequestClose={onClose}
      hideBorder
      data-test="notesImportMarkdownModal"
    >
      <Styled.Container>
        <Styled.Textarea
          data-test="notesImportMarkdownTextarea"
          aria-label={intl.formatMessage(intlMessages.placeholder)}
          placeholder={intl.formatMessage(intlMessages.placeholder)}
          value={markdown}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMarkdown(e.target.value)}
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
