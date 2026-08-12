import React, { useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Button from '/imports/ui/components/common/button/component';
import BBBMenu from '/imports/ui/components/common/menu/component';

const intlMessages = defineMessages({
  insertPagesLabel: {
    id: 'app.presentation.presentationToolbar.insertPagesLabel',
    description: 'Insert pages split button label',
  },
  insertBlankPage: {
    id: 'app.presentation.presentationToolbar.insertBlankPage',
    description: 'Insert a blank page menu item',
  },
  insertPagesFromFile: {
    id: 'app.presentation.presentationToolbar.insertPagesFromFile',
    description: 'Insert pages from a file menu item',
  },
});

interface InsertPagesToolbarButtonProps {
  disabled: boolean;
  inFlight: boolean;
  tooltipLabel: string;
  acceptMimeTypes: string;
  onInsertBlank: () => void;
  onInsertFromFile: (file: File) => void;
}

const InsertPagesToolbarButton: React.FC<InsertPagesToolbarButtonProps> = ({
  disabled,
  inFlight,
  tooltipLabel,
  acceptMimeTypes,
  onInsertBlank,
  onInsertFromFile,
}) => {
  const intl = useIntl();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = () => {
    const input = fileInputRef.current;
    const file = input?.files?.[0];
    // Reset so selecting the same file again still fires onChange.
    if (input) input.value = '';
    if (file) onInsertFromFile(file);
  };

  const label = intl.formatMessage(intlMessages.insertPagesLabel);

  const actions = [
    {
      key: 'insert-blank-page',
      dataTest: 'insertBlankPage',
      label: intl.formatMessage(intlMessages.insertBlankPage),
      icon: 'add',
      disabled,
      onClick: onInsertBlank,
    },
    {
      key: 'insert-pages-from-file',
      dataTest: 'insertPagesFromFile',
      label: intl.formatMessage(intlMessages.insertPagesFromFile),
      icon: 'upload',
      disabled,
      onClick: () => fileInputRef.current?.click(),
    },
  ];

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptMimeTypes}
        hidden
        onChange={handleFileChange}
        data-test="insertPagesFileInput"
      />
      <BBBMenu
        trigger={(
          <Button
            role="button"
            data-test="insertPagesButton"
            aria-label={label}
            label={label}
            tooltipLabel={tooltipLabel}
            hideLabel
            color="light"
            circle
            icon="plus"
            size="md"
            disabled={disabled || inFlight}
            onClick={() => null}
          />
        )}
        opts={{
          id: 'presentation-insert-pages-dropdown',
          keepMounted: true,
          transitionDuration: 0,
          elevation: 2,
          getcontentanchorel: null,
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          transformOrigin: { vertical: 'bottom', horizontal: 'center' },
        }}
        actions={actions}
      />
    </>
  );
};

export default InsertPagesToolbarButton;
