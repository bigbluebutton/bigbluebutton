import React, {
  useCallback, useMemo, useRef, useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Button from '/imports/ui/components/common/button/component';
import { insertBlankPage, insertPages, InsertRequest } from './service';
import Styled from './styles';

const intlMessages = defineMessages({
  insertPagesLabel: {
    id: 'app.presentation.insertPages.button',
    description: 'Label of the button that inserts pages into the presentation',
  },
  insertPagesDesc: {
    id: 'app.presentation.insertPages.buttonDesc',
    description: 'Tooltip of the button that inserts pages into the presentation',
  },
  blankPageLabel: {
    id: 'app.presentation.insertPages.blankPage',
    description: 'Menu item that inserts a blank page',
  },
  fromFileLabel: {
    id: 'app.presentation.insertPages.fromFile',
    description: 'Menu item that inserts the pages of a file',
  },
});

interface InsertPagesButtonProps {
  presentationId: string;
  currentSlideNum: number;
  numberOfSlides: number;
  isConnected: boolean;
}

// Pages enter after the current slide, and the presenter is taken to the first of them. The position goes
// with the total read in the same page row, so the server can follow it if the order changes meanwhile.
const InsertPagesButton: React.FC<InsertPagesButtonProps> = ({
  presentationId,
  currentSlideNum,
  numberOfSlides,
  isConnected,
}) => {
  const intl = useIntl();
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const presentationConfig = window.meetingClientSettings.public.presentation;

  // PDF and office documents: the upload types that are not images.
  const accept = useMemo(() => presentationConfig.uploadValidMimeTypes
    .filter((type) => !type.mime.startsWith('image/'))
    .map((type) => type.extension)
    .join(','), [presentationConfig]);

  // The button stays disabled until the request and, for a file, its upload end.
  const run = useCallback((request: () => InsertRequest) => {
    setBusy(true);
    request().done.then(() => setBusy(false));
  }, []);

  const handleBlankPage = useCallback(() => {
    run(() => insertBlankPage(presentationId, currentSlideNum + 1, numberOfSlides, true));
  }, [run, presentationId, currentSlideNum, numberOfSlides]);

  const handleFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // eslint-disable-next-line no-param-reassign
    event.target.value = '';
    if (!file) return;
    run(() => insertPages(presentationId, file, currentSlideNum + 1, numberOfSlides, true));
  }, [run, presentationId, currentSlideNum, numberOfSlides]);

  if (!presentationConfig.insertPagesEnabled) return null;

  const disabled = busy || !isConnected || !presentationId || numberOfSlides < 1;
  const label = intl.formatMessage(intlMessages.insertPagesLabel);

  return (
    <>
      <BBBMenu
        disabled={disabled}
        trigger={(
          <Button
            data-test="insertPagesButton"
            aria-label={label}
            label={label}
            tooltipLabel={intl.formatMessage(intlMessages.insertPagesDesc)}
            hideLabel
            color="light"
            circle
            icon="add"
            size="md"
            disabled={disabled}
            onClick={() => null}
          />
        )}
        actions={[
          {
            key: 'insert-blank-page',
            dataTest: 'insertBlankPage',
            label: intl.formatMessage(intlMessages.blankPageLabel),
            onClick: handleBlankPage,
          },
          {
            key: 'insert-pages-from-file',
            dataTest: 'insertPagesFromFile',
            label: intl.formatMessage(intlMessages.fromFileLabel),
            onClick: () => fileInput.current?.click(),
          },
        ]}
        opts={{
          id: 'insert-pages-dropdown',
          keepMounted: true,
          transitionDuration: 0,
          elevation: 3,
          getcontentanchorel: null,
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          transformOrigin: { vertical: 'bottom', horizontal: 'center' },
        }}
      />
      <Styled.HiddenFileInput
        ref={fileInput}
        type="file"
        accept={accept}
        onChange={handleFile}
        data-test="insertPagesFileInput"
        tabIndex={-1}
        aria-hidden
      />
    </>
  );
};

export default React.memo(InsertPagesButton);
