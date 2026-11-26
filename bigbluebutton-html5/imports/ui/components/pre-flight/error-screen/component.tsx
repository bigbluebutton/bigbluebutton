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
  icon?: React.ReactNode;
  variant?: BBButtonProps['variant'];
  color?: BBButtonProps['color'];
  dataTest?: string;
}

export type PreFlightErrorTone = 'warning' | 'danger';

interface PreFlightErrorHeaderProps {
  badge?: string;
  // The badge's own icon; a warning sign by default.
  badgeIcon?: React.ReactNode;
  tone?: PreFlightErrorTone;
  title: string;
  // The guest denial's heading wraps at 432px; the connection and device
  // screens wrap it at 495px (275px in the phone dialog), the device title's
  // two-line break.
  wideTitle?: boolean;
  description?: string;
  // Opens in a new tab: the screen it leaves holds the session.
  helpLink?: { label: string; url: string };
  announcement?: string;
  notice?: string;
  windowTitle?: string;
  dataTest?: string;
}

export const PreFlightErrorHeader: React.FC<PreFlightErrorHeaderProps> = ({
  badge,
  badgeIcon = <WarningIcon />,
  tone = 'warning',
  title,
  wideTitle = false,
  description,
  helpLink,
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
          <Styled.NoticeBadge $tone={tone}>
            <Styled.BadgeIcon aria-hidden="true">{badgeIcon}</Styled.BadgeIcon>
            {badge}
          </Styled.NoticeBadge>
        )}
        <Styled.ErrorText>
          <Styled.ErrorHeading id={ERROR_HEADING_ID} $wide={wideTitle}>{title}</Styled.ErrorHeading>
          {description && <Styled.ErrorDescription>{description}</Styled.ErrorDescription>}
        </Styled.ErrorText>
        {announcement && <span className="sr-only">{announcement}</span>}
      </Styled.ErrorBlock>
      {helpLink?.url && (
        <Styled.HelpLink
          href={helpLink.url}
          target="_blank"
          rel="noopener noreferrer"
          data-test="preFlightErrorHelpLink"
        >
          {helpLink.label}
        </Styled.HelpLink>
      )}
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
      label, onClick, icon, variant = 'subtle', color = 'default', dataTest,
    }) => (
      <BBButton
        key={label}
        variant={variant}
        color={color}
        label={label}
        iconStart={icon}
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
