import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import MenuItem from '@mui/material/MenuItem';
import { SelectChangeEvent } from '@mui/material/Select';
import EditIcon from '@mui/icons-material/Edit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckIcon from '@mui/icons-material/Check';
import { BBBSelect } from '@bigbluebutton/bbb-ui-components-react';
import { BBBToggle } from '@bigbluebutton/bbb-ui-components-react/Toggle';
import Styled from './styles';
import { usePreFlight } from '../../context';
import { isChatAvailable } from '../../features';
import { RoomModeDefinition } from '../modes';
import {
  AUTOMATIC_SETTINGS,
  EDITABLE_SETTINGS,
  RoomModeRoomValues,
  resolveRoomModeSettings,
  SelectSetting,
  SwitchSetting,
} from '../settings';

const intlMessages = defineMessages({
  editable: {
    id: 'app.preFlight.roomMode.summary.editable',
    description: 'Heading of the room mode settings the moderator can change before starting',
  },
  automatic: {
    id: 'app.preFlight.roomMode.summary.automatic',
    description: 'Heading of the room mode settings applied without asking',
  },
});

const EDITABLE_HEADING_ID = 'preFlightRoomModeEditableHeading';
const AUTOMATIC_HEADING_ID = 'preFlightRoomModeAutomaticHeading';

interface RoomModeSummaryProps {
  mode: RoomModeDefinition;
  roomValues: RoomModeRoomValues;
  // Once Start room is pressed the settings are final, as the cards are.
  isJoining: boolean;
}

/**
 * What the picked mode will apply, split as the design's legend splits it:
 * the settings the moderator can still change, and those applied without
 * asking. Edits stay in the pre-flight; nothing reaches the room from here.
 */
const RoomModeSummary: React.FC<RoomModeSummaryProps> = ({ mode, roomValues, isJoining }) => {
  const intl = useIntl();
  const { roomModeEdits, setRoomModeEdit } = usePreFlight();

  const values = resolveRoomModeSettings(mode.preset, roomModeEdits, roomValues);

  // The label hugs the switch: BBBToggle has no layout for a label at the
  // start and the switch at the end (bbb-ui-components-react#112).
  const renderSwitch = (setting: SwitchSetting) => {
    const checked = values[setting.id] === true;
    const helper = setting.helper && (checked ? setting.helper.on : setting.helper.off);

    const id = `preFlightRoomMode-${setting.id}`;

    // Locked while joining, not disabled: a disabled switch would leave the tab
    // order, as the cards would.
    return (
      <BBBToggle
        key={setting.id}
        id={id}
        checked={checked}
        onChange={(_event: React.ChangeEvent<HTMLInputElement>, next: boolean) => {
          if (!isJoining) setRoomModeEdit(setting.id, next);
        }}
        label={intl.formatMessage(setting.label)}
        helperText={helper && intl.formatMessage(helper)}
        textPosition="left"
        // BBBToggle puts aria-labelledby and aria-describedby on the switch's
        // span, not its input, so the helper reads as part of the name: pointed
        // at the ids it renders until the library fixes it.
        inputProps={{
          'data-test': setting.dataTest,
          'aria-labelledby': `${id}-label`,
          'aria-describedby': helper ? `${id}-helper` : undefined,
          'aria-disabled': isJoining || undefined,
        } as React.InputHTMLAttributes<HTMLInputElement>}
      />
    );
  };

  const renderSelect = (setting: SelectSetting, value: string) => {
    // A value this list does not offer stays on offer while it is the room's
    // or the picked one: the moderator can go back to it, and the select never
    // shows a value it has no option for.
    const options = [
      ...setting.options,
      ...(setting.hiddenOptions ?? []).filter(
        (option) => option.value === roomValues[setting.id] || option.value === value,
      ),
    ];

    return (
      <BBBSelect
        key={setting.id}
        title={intl.formatMessage(setting.label)}
        value={value}
        // Read-only while joining: it stays focusable but does not open.
        readOnly={isJoining}
        onChange={(event: SelectChangeEvent<unknown>) => {
          // Only a value the list offers is staged.
          const picked = options.find((option) => option.value === event.target.value);
          if (picked && !isJoining) setRoomModeEdit(setting.id, picked.value);
        }}
        SelectDisplayProps={{
          'data-test': setting.dataTest,
          'data-value': value,
          'aria-disabled': isJoining || undefined,
        } as React.HTMLAttributes<HTMLDivElement>}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {intl.formatMessage(option.label)}
          </MenuItem>
        ))}
      </BBBSelect>
    );
  };

  return (
    <Styled.Settings data-test="preFlightRoomModeSummary">
      <Styled.Group role="group" aria-labelledby={EDITABLE_HEADING_ID}>
        <Styled.GroupHeading id={EDITABLE_HEADING_ID}>
          <EditIcon aria-hidden />
          {intl.formatMessage(intlMessages.editable)}
        </Styled.GroupHeading>
        <Styled.Controls>
          {EDITABLE_SETTINGS.map((setting) => {
            const value = values[setting.id];
            // A setting the mode leaves as created, and whose value the room
            // did not give, cannot be shown truthfully.
            if (value === undefined) return null;
            // As in the lock viewers modal, a room without chat has no public
            // chat to lock.
            if (setting.id === 'publicChat' && !isChatAvailable()) return null;
            return setting.kind === 'switch'
              ? renderSwitch(setting)
              : renderSelect(setting, String(value));
          })}
        </Styled.Controls>
      </Styled.Group>
      <Styled.Group role="group" aria-labelledby={AUTOMATIC_HEADING_ID}>
        <Styled.GroupHeading id={AUTOMATIC_HEADING_ID}>
          <AutoAwesomeIcon aria-hidden />
          {intl.formatMessage(intlMessages.automatic)}
        </Styled.GroupHeading>
        <Styled.AutomaticList>
          {AUTOMATIC_SETTINGS.filter((setting) => setting.appliesTo(mode.preset, roomValues)).map((setting) => (
            <Styled.AutomaticItem key={setting.id} data-test={setting.dataTest}>
              <CheckIcon aria-hidden />
              {intl.formatMessage(setting.label)}
            </Styled.AutomaticItem>
          ))}
        </Styled.AutomaticList>
      </Styled.Group>
    </Styled.Settings>
  );
};

export default RoomModeSummary;
