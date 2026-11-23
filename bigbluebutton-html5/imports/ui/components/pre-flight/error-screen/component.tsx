import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import WarningIcon from '@mui/icons-material/WarningAmberRounded';
import CloseIcon from '@mui/icons-material/Close';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import { colorScrim } from '/imports/ui/stylesheets/styled-components/palette';
import Styled from './styles';

const intlMessages = defineMessages({
  close: {
    id: 'app.modal.close',
    description: 'Label of the button that closes the error dialog',
  },
});

// Names the dialog on a phone; one error screen is up at a time.
const ERROR_HEADING_ID = 'preFlightErrorHeading';

type BBButtonProps = React.ComponentProps<typeof BBButton>;

export interface PreFlightErrorAction {
  label: string;
  onClick: () => void;
  variant?: BBButtonProps['variant'];
  color?: BBButtonProps['color'];
  dataTest?: string;
}

interface PreFlightErrorHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  announcement?: string;
  notice?: string;
  windowTitle?: string;
  dataTest?: string;
}

export const PreFlightErrorHeader: React.FC<PreFlightErrorHeaderProps> = ({
  badge,
  title,
  description,
  announcement,
  notice,
  windowTitle,
  dataTest,
}) => {
  useEffect(() => {
    if (windowTitle) document.title = windowTitle;
  }, [windowTitle]);

  return (
    <>
      <Styled.ErrorBlock role="alert" data-test={dataTest}>
        {badge && (
          <Styled.NoticeBadge>
            <WarningIcon aria-hidden="true" />
            {badge}
          </Styled.NoticeBadge>
        )}
        <Styled.ErrorText>
          <Styled.ErrorHeading id={ERROR_HEADING_ID}>{title}</Styled.ErrorHeading>
          {description && <Styled.ErrorDescription>{description}</Styled.ErrorDescription>}
        </Styled.ErrorText>
        {announcement && <span className="sr-only">{announcement}</span>}
      </Styled.ErrorBlock>
      {notice && (
        <Styled.ErrorNotice aria-live="off" data-test="preFlightErrorNotice">
          {notice}
        </Styled.ErrorNotice>
      )}
    </>
  );
};

interface PreFlightErrorActionsProps {
  actions: PreFlightErrorAction[];
}

export const PreFlightErrorActions: React.FC<PreFlightErrorActionsProps> = ({ actions }) => (
  <Styled.ErrorActions>
    {actions.map(({
      label, onClick, variant = 'subtle', color = 'default', dataTest,
    }) => (
      <BBButton
        key={label}
        variant={variant}
        color={color}
        label={label}
        onClick={onClick}
        dataTest={dataTest}
      />
    ))}
  </Styled.ErrorActions>
);

interface PreFlightErrorDialogProps {
  // The error has no way back into the lobby, so closing the dialog does
  // whatever its main action does.
  onClose: () => void;
  children: React.ReactNode;
}

export const PreFlightErrorDialog: React.FC<PreFlightErrorDialogProps> = ({ onClose, children }) => {
  const intl = useIntl();
  // The pre-flight renders before the app registers its modal root, so the
  // dialog names the element it hides from assistive technology itself.
  const appElement = document.getElementById('app') ?? undefined;

  return (
    <Styled.Dialog
      isOpen
      onRequestClose={onClose}
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
      appElement={appElement}
      aria={{ labelledby: ERROR_HEADING_ID }}
      style={{
        overlay: {
          position: 'fixed',
          inset: 0,
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colorScrim,
        },
      }}
      data={{ test: 'preFlightErrorDialog' }}
    >
      <Styled.DialogClose>
        <BBButton
          layout="circle"
          variant="subtle"
          size="sm"
          icon={<CloseIcon />}
          ariaLabel={intl.formatMessage(intlMessages.close)}
          onClick={onClose}
          dataTest="preFlightErrorDialogClose"
        />
      </Styled.DialogClose>
      {children}
    </Styled.Dialog>
  );
};
