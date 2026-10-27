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
  RoomModeEditableId,
  RoomModeEditableValues,
  RoomModeEdits,
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

// The pre-flight's prefix, for both element ids and data-test ids.
const PRE_FLIGHT_PREFIX = 'preFlightRoomMode';

interface RoomModeSummaryViewProps {
  mode: RoomModeDefinition;
  // What a setting falls back to when neither an edit nor the mode sets it.
  roomValues: RoomModeRoomValues;
  edits: RoomModeEdits;
  onEdit: <K extends RoomModeEditableId>(id: K, value: RoomModeEditableValues[K]) => void;
  // Once the pick is being applied the settings are final, as the cards are.
  locked: boolean;
  // Element ids and data-test ids start with it, so two places can list a mode.
  prefix: string;
  // A group of its own, listed after the automatic settings.
  extraGroup?: React.ReactNode;
}

/**
 * What a mode will apply, split as the design's legend splits it: the
 * settings the moderator can still change, and those applied without asking.
 * Edits stay with the caller; nothing reaches the room from here.
 */
export const RoomModeSummaryView: React.FC<RoomModeSummaryViewProps> = ({
  mode,
  roomValues,
  edits,
  onEdit,
  locked,
  prefix,
  extraGroup,
}) => {
  const intl = useIntl();
  const editableHeadingId = `${prefix}EditableHeading`;
  const automaticHeadingId = `${prefix}AutomaticHeading`;

  const values = resolveRoomModeSettings(mode.preset, edits, roomValues);

  const renderSwitch = (setting: SwitchSetting) => {
    const checked = values[setting.id] === true;
    const helper = setting.helper && (checked ? setting.helper.on : setting.helper.off);

    const id = `${prefix}-${setting.id}`;

    // Locked, not disabled: a disabled switch would leave the tab order, as the
    // cards would.
    return (
      <BBBToggle
        key={setting.id}
        id={id}
        checked={checked}
        onChange={(_event: React.ChangeEvent<HTMLInputElement>, next: boolean) => {
          if (!locked) onEdit(setting.id, next);
        }}
        label={intl.formatMessage(setting.label)}
        helperText={helper && intl.formatMessage(helper)}
        textPosition="left"
        fullWidth
        slotProps={{
          input: {
            'data-test': `${prefix}${setting.testId}`,
            'aria-disabled': locked || undefined,
          } as React.InputHTMLAttributes<HTMLInputElement>,
        }}
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
        // Read-only while locked: it stays focusable but does not open.
        readOnly={locked}
        onChange={(event: SelectChangeEvent<unknown>) => {
          // Only a value the list offers is staged.
          const picked = options.find((option) => option.value === event.target.value);
          if (picked && !locked) onEdit(setting.id, picked.value);
        }}
        SelectDisplayProps={{
          'data-test': `${prefix}${setting.testId}`,
          'data-value': value,
          'aria-disabled': locked || undefined,
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
    <Styled.Settings data-test={`${prefix}Summary`}>
      <Styled.Group role="group" aria-labelledby={editableHeadingId}>
        <Styled.GroupHeading id={editableHeadingId}>
          <EditIcon aria-hidden />
          {intl.formatMessage(intlMessages.editable)}
        </Styled.GroupHeading>
        <Styled.Controls $locked={locked}>
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
      <Styled.Group role="group" aria-labelledby={automaticHeadingId}>
        <Styled.GroupHeading id={automaticHeadingId}>
          <AutoAwesomeIcon aria-hidden />
          {intl.formatMessage(intlMessages.automatic)}
        </Styled.GroupHeading>
        <Styled.AutomaticList>
          {AUTOMATIC_SETTINGS.filter((setting) => setting.appliesTo(mode.preset, roomValues)).map((setting) => (
            <Styled.AutomaticItem key={setting.id} data-test={`${prefix}${setting.testId}`}>
              <CheckIcon aria-hidden />
              {intl.formatMessage(setting.label)}
            </Styled.AutomaticItem>
          ))}
        </Styled.AutomaticList>
      </Styled.Group>
      {extraGroup}
    </Styled.Settings>
  );
};

interface RoomModeSummaryProps {
  mode: RoomModeDefinition;
  roomValues: RoomModeRoomValues;
  // Once Start room is pressed the settings are final, as the cards are.
  isJoining: boolean;
}

// The pre-flight's summary: the edits live in the pre-flight's state.
const RoomModeSummary: React.FC<RoomModeSummaryProps> = ({ mode, roomValues, isJoining }) => {
  const { roomModeEdits, setRoomModeEdit } = usePreFlight();

  return (
    <RoomModeSummaryView
      mode={mode}
      roomValues={roomValues}
      edits={roomModeEdits}
      onEdit={setRoomModeEdit}
      locked={isJoining}
      prefix={PRE_FLIGHT_PREFIX}
    />
  );
};

export default RoomModeSummary;
