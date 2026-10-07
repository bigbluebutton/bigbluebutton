import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import { MdAutoAwesomeMosaic } from 'react-icons/md';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { BBBToggle } from '@bigbluebutton/bbb-ui-components-react';
import logger from '/imports/startup/client/logger';
import deviceInfo from '/imports/utils/deviceInfo';
import { throttle } from '/imports/utils/throttle';
import Button from '/imports/ui/components/common/button/component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { useIsWebcamGridEnabled } from '/imports/ui/services/features';
import { useHideUsersWithoutCamera } from '/imports/ui/components/video-provider/hooks';
import { SET_HIDE_USERS_WITHOUT_CAMERA } from '/imports/ui/core/graphql/mutations/userMutations';
import { listItemBgHover } from '/imports/ui/stylesheets/styled-components/palette';
import Styled from './styles';

const intlMessages = defineMessages({
  buttonLabel: {
    id: 'app.actionsBar.layoutView.button',
    description: 'Label for the actions bar button that opens the layout view options',
  },
  title: {
    id: 'app.actionsBar.layoutView.title',
    description: 'Title of the layout view options popover',
  },
  closeLabel: {
    id: 'app.actionsBar.layoutView.close',
    description: 'Label for the button that closes the layout view options popover',
  },
  hideUsersWithoutCameraLabel: {
    id: 'app.actionsBar.layoutView.hideUsersWithoutCamera.label',
    description: 'Label for the toggle that hides participants without camera for the whole meeting',
  },
  hideUsersWithoutCameraDesc: {
    id: 'app.actionsBar.layoutView.hideUsersWithoutCamera.description',
    description: 'Helper text for the toggle that hides participants without camera',
  },
});

const TITLE_ID = 'layoutViewTitle';
const TOGGLE_THROTTLE_TIME = 300;
// How long the requested value is shown after the server accepts it without reporting it back.
const PENDING_VALUE_TIMEOUT = 2000;

const LayoutViewButton: React.FC = () => {
  const intl = useIntl();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { data: currentUser } = useCurrentUser((u) => ({
    presenter: u.presenter,
    isModerator: u.isModerator,
  }));
  const isWebcamGridEnabled = useIsWebcamGridEnabled();
  const hideUsersWithoutCamera = useHideUsersWithoutCamera();
  const [setHideUsersWithoutCamera] = useMutation(SET_HIDE_USERS_WITHOUT_CAMERA);
  // Last value requested by this user, shown until the subscription catches up so
  // quick consecutive clicks build on each other instead of on a stale server value.
  const [pendingValue, setPendingValue] = useState<boolean | null>(null);
  const requestedValue = useRef(false);
  const pendingTimeout = useRef<ReturnType<typeof setTimeout>>();
  const isChecked = pendingValue ?? hideUsersWithoutCamera;

  // Throttled like the mute toggle; reads the ref so the trailing call sends the latest value.
  const sendRequestedValue = useMemo(() => throttle(() => {
    const value = requestedValue.current;
    clearTimeout(pendingTimeout.current);
    setHideUsersWithoutCamera({
      variables: { hideUsersWithoutCamera: value },
    }).then(() => {
      // The subscription may never report the requested value: a quick on/off can reach the
      // client as no change at all. Fall back to the server value so the toggle can't get stuck.
      clearTimeout(pendingTimeout.current);
      pendingTimeout.current = setTimeout(() => setPendingValue(null), PENDING_VALUE_TIMEOUT);
    }).catch((error) => {
      logger.error({
        logCode: 'layout_view_hide_users_without_camera_failed',
        extraInfo: { value, errorMessage: error?.message },
      }, `Failed to set hideUsersWithoutCamera to ${value}: ${error?.message}`);
      setPendingValue(null);
    });
  }, TOGGLE_THROTTLE_TIME), [setHideUsersWithoutCamera]);

  useEffect(() => () => {
    sendRequestedValue.cancel();
    clearTimeout(pendingTimeout.current);
  }, [sendRequestedValue]);

  // Only a server change can settle the request, so intermediate echoes don't flicker.
  useEffect(() => {
    setPendingValue((pending) => (pending === hideUsersWithoutCamera ? null : pending));
  }, [hideUsersWithoutCamera]);

  const canToggle = !!(currentUser?.presenter || currentUser?.isModerator);
  const isAvailable = canToggle && isWebcamGridEnabled;

  // Don't reopen by itself if the user loses the role with the popover open and gets it back.
  useEffect(() => {
    if (!isAvailable) setIsOpen(false);
  }, [isAvailable]);

  if (!isAvailable) return null;

  const handleToggle = () => {
    const nextValue = !isChecked;
    requestedValue.current = nextValue;
    clearTimeout(pendingTimeout.current);
    setPendingValue(nextValue);
    sendRequestedValue();
  };

  const buttonLabel = intl.formatMessage(intlMessages.buttonLabel);

  return (
    <Styled.Anchor ref={anchorRef}>
      {/* An explicit tooltipLabel keeps Button from re-mounting when aria-expanded flips,
          so the popover can hand focus back to the trigger on close. */}
      <Button
        data-test="layoutViewButton"
        customIcon={<MdAutoAwesomeMosaic size="1.5rem" />}
        label={buttonLabel}
        tooltipLabel={buttonLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        color={isOpen ? 'primary' : 'default'}
        hideLabel
        circle
        size={deviceInfo.isMobile ? 'md' : 'lg'}
        hoverColor={listItemBgHover}
      />
      <Styled.Panel
        open={isOpen}
        anchorEl={anchorRef.current}
        onClose={() => setIsOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-labelledby': TITLE_ID,
            'data-test': 'layoutViewPanel',
          } as React.HTMLAttributes<HTMLDivElement>,
        }}
      >
        <Styled.Header>
          <h2 id={TITLE_ID}>{intl.formatMessage(intlMessages.title)}</h2>
          <IconButton
            data-test="closeLayoutViewPanel"
            aria-label={intl.formatMessage(intlMessages.closeLabel)}
            onClick={() => setIsOpen(false)}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Styled.Header>
        <Styled.Content>
          <BBBToggle
            data-test="hideUsersWithoutCameraToggle"
            checked={isChecked}
            onChange={handleToggle}
            label={intl.formatMessage(intlMessages.hideUsersWithoutCameraLabel)}
            helperText={intl.formatMessage(intlMessages.hideUsersWithoutCameraDesc)}
            textPosition="right"
          />
        </Styled.Content>
      </Styled.Panel>
    </Styled.Anchor>
  );
};

export default LayoutViewButton;
