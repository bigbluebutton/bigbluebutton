import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import { MdAutoAwesomeMosaic } from 'react-icons/md';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { BBBSlider, BBBToggle } from '@bigbluebutton/bbb-ui-components-react';
import deviceInfo from '/imports/utils/deviceInfo';
import Button from '/imports/ui/components/common/button/component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { useIsLayoutViewEnabled, useIsWebcamGridEnabled } from '/imports/ui/services/features';
import {
  useCameraPageSizeRange,
  useHideUsersWithoutCamera,
  useMeetingCameraPageSize,
} from '/imports/ui/components/video-provider/hooks';
import { SET_CAMERA_PAGE_SIZE, SET_HIDE_USERS_WITHOUT_CAMERA } from '/imports/ui/core/graphql/mutations/userMutations';
import { listItemBgHover } from '/imports/ui/stylesheets/styled-components/palette';
import Styled from './styles';
import { usePendingRequest } from './hooks';

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
  cameraPageSizeLabel: {
    id: 'app.actionsBar.layoutView.cameraPageSize.label',
    description: 'Label for the slider that sets how many cameras each page shows for the whole meeting',
  },
  cameraPageSizeDesc: {
    id: 'app.actionsBar.layoutView.cameraPageSize.description',
    description: 'Helper text for the slider that sets how many cameras each page shows',
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

const LayoutViewButton: React.FC = () => {
  const intl = useIntl();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { data: currentUser } = useCurrentUser((u) => ({
    presenter: u.presenter,
    isModerator: u.isModerator,
  }));
  const isWebcamGridEnabled = useIsWebcamGridEnabled();
  const isLayoutViewEnabled = useIsLayoutViewEnabled();

  const hideUsersWithoutCamera = useHideUsersWithoutCamera();
  const [setHideUsersWithoutCamera] = useMutation(SET_HIDE_USERS_WITHOUT_CAMERA);
  const [isChecked, requestHideUsersWithoutCamera] = usePendingRequest(
    hideUsersWithoutCamera,
    (value) => setHideUsersWithoutCamera({ variables: { hideUsersWithoutCamera: value } }),
    'hideUsersWithoutCamera',
    'layout_view_hide_users_without_camera_failed',
  );

  const meetingPageSize = useMeetingCameraPageSize();
  const { max: maxPageSize, viewerPageSize } = useCameraPageSizeRange();
  const [setCameraPageSize] = useMutation(SET_CAMERA_PAGE_SIZE);
  // Until someone sets it, the slider shows what viewers get from config; 0 is unlimited.
  const [pageSize, requestPageSize] = usePendingRequest(
    meetingPageSize ?? (viewerPageSize > 0 ? viewerPageSize : maxPageSize),
    (value) => setCameraPageSize({ variables: { cameraPageSize: value } }),
    'cameraPageSize',
    'layout_view_camera_page_size_failed',
  );
  const [draggedPageSize, setDraggedPageSize] = useState<number | null>(null);
  // A size set while the meeting was smaller may be above what a pagination threshold now allows.
  const sliderValue = Math.min(draggedPageSize ?? pageSize, maxPageSize);

  const {
    paginationToggleEnabled,
  } = window.meetingClientSettings.public.kurento.pagination;
  const {
    paginationEnabled: defaultPaginationEnabled,
  } = window.meetingClientSettings.public.app.defaultSettings.application;
  // Without pagination for anyone, the page size changes nothing. A range of one value
  // leaves nothing to pick.
  const isSliderAvailable = (paginationToggleEnabled || defaultPaginationEnabled) && maxPageSize > 1;

  const canChange = !!(currentUser?.presenter || currentUser?.isModerator);
  const isAvailable = canChange && isLayoutViewEnabled && (isWebcamGridEnabled || isSliderAvailable);

  // Don't reopen by itself if the user loses the role with the popover open and gets it back.
  useEffect(() => {
    if (!isAvailable) setIsOpen(false);
  }, [isAvailable]);

  if (!isAvailable) return null;

  const formatPageSize = (value: number) => intl.formatNumber(value, { minimumIntegerDigits: 2 });

  const handlePageSizeCommitted = (_event: React.SyntheticEvent | Event, value: number) => {
    setDraggedPageSize(null);
    // While unset, the shown value follows config, so picking it still stores it.
    if (value !== pageSize || meetingPageSize === null) requestPageSize(value);
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
        {isSliderAvailable && (
          <Styled.Content>
            <BBBSlider
              dataTest="cameraPageSizeSlider"
              label={intl.formatMessage(intlMessages.cameraPageSizeLabel)}
              helperText={intl.formatMessage(intlMessages.cameraPageSizeDesc)}
              value={sliderValue}
              min={1}
              max={maxPageSize}
              step={1}
              marks={[
                { value: 1, label: formatPageSize(1) },
                { value: maxPageSize, label: formatPageSize(maxPageSize) },
              ]}
              showMarkTicks={false}
              valueLabelFormat={formatPageSize}
              onChange={(_event, value) => setDraggedPageSize(value)}
              onChangeCommitted={handlePageSizeCommitted}
            />
          </Styled.Content>
        )}
        {isWebcamGridEnabled && (
          <Styled.Content>
            <BBBToggle
              data-test="hideUsersWithoutCameraToggle"
              checked={isChecked}
              onChange={() => requestHideUsersWithoutCamera(!isChecked)}
              label={intl.formatMessage(intlMessages.hideUsersWithoutCameraLabel)}
              helperText={intl.formatMessage(intlMessages.hideUsersWithoutCameraDesc)}
              textPosition="right"
            />
          </Styled.Content>
        )}
      </Styled.Panel>
    </Styled.Anchor>
  );
};

export default LayoutViewButton;
