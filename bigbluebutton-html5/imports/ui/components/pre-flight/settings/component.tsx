import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import SettingsIcon from '@mui/icons-material/Settings';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import Settings from '/imports/ui/components/settings/component';
import { useSettingsProps } from '/imports/ui/components/settings/container';
import { updateSettings } from '/imports/ui/components/settings/service';
import useCurrentLocale from '/imports/ui/core/local-states/useCurrentLocale';
import Styled from './styles';

const intlMessages = defineMessages({
  settingsLabel: {
    id: 'app.userList.settingsTitle',
    description: 'Label of the button that opens the settings modal',
  },
});

// Before the join: no toast, and IntlAdapter syncs the server once the client mounts.
const updateSettingsBeforeJoin = (settings: Record<string, unknown>) => updateSettings(settings, null);

const noLayoutDispatch = () => {};

interface PreFlightSettingsModalProps {
  setIsOpen: (isOpen: boolean) => void;
}

const PreFlightSettingsModal: React.FC<PreFlightSettingsModalProps> = ({ setIsOpen }) => {
  const settingsProps = useSettingsProps();
  // The settings only get the locale from IntlAdapter, after the join.
  const [currentLocale] = useCurrentLocale();
  const application = { ...(settingsProps.application as Record<string, unknown>), locale: currentLocale };

  return (
    <Settings
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...settingsProps}
      application={application}
      updateSettings={updateSettingsBeforeJoin}
      layoutContextDispatch={noLayoutDispatch}
      isOpen
      setIsOpen={setIsOpen}
    />
  );
};

const PreFlightSettings: React.FC = () => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Styled.Footer>
      <Styled.SettingsButtonWrapper>
        <BBButton
          variant="subtle"
          label={intl.formatMessage(intlMessages.settingsLabel)}
          iconStart={<SettingsIcon />}
          onClick={() => setIsOpen(true)}
          dataTest="preFlightSettingsButton"
        />
      </Styled.SettingsButtonWrapper>
      {isOpen && <PreFlightSettingsModal setIsOpen={setIsOpen} />}
    </Styled.Footer>
  );
};

export default PreFlightSettings;
