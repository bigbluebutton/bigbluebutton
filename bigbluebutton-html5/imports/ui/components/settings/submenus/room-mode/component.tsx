import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import SettingsIcon from '@mui/icons-material/Settings';
import LockIcon from '@mui/icons-material/Lock';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import { BBBToggle } from '@bigbluebutton/bbb-ui-components-react/Toggle';
import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import meetingStaticData from '/imports/ui/core/singletons/meetingStaticData';
import {
  useIsBreakoutRoomsEnabled,
  useIsPollingEnabled,
  useIsReactionsEnabled,
  useIsVirtualBackgroundsEnabled,
} from '/imports/ui/services/features';
import { RoomModeCards } from '/imports/ui/components/pre-flight/room-mode/component';
import { RoomModeSummaryView } from '/imports/ui/components/pre-flight/room-mode/summary/component';
import SummaryStyled from '/imports/ui/components/pre-flight/room-mode/summary/styles';
import { getRoomMode, RoomModeDefinition } from '/imports/ui/components/pre-flight/room-mode/modes';
import { useRoomModeApplier } from '/imports/ui/components/pre-flight/room-mode/applier';
import useRoomModeBase from '/imports/ui/components/pre-flight/room-mode/base';
import {
  RoomModeEdits,
  RoomModeRoomValues,
  resolveRoomModeSettings,
  settingsToApply,
} from '/imports/ui/components/pre-flight/room-mode/settings';
import RoomModeStyled from '/imports/ui/components/pre-flight/room-mode/styles';
import SubMenuStyled from '../styles';
import Styled from './styles';

const intlMessages = defineMessages({
  title: {
    id: 'app.settings.roomMode.title',
    description: 'Title of the room modes tab in the settings window',
  },
  description: {
    id: 'app.settings.roomMode.description',
    description: 'Description under the room modes tab title',
  },
  editLabel: {
    id: 'app.settings.roomMode.editLabel',
    description: 'Accessible name of the button that opens a room mode settings',
  },
  summaryTitle: {
    id: 'app.settings.roomMode.summaryTitle',
    description: 'Title of a room mode settings in the settings window',
  },
  summaryDescription: {
    id: 'app.settings.roomMode.summaryDescription',
    description: 'Description under the title of a room mode settings',
  },
  selectedLabel: {
    id: 'app.preFlight.roomMode.selectedLabel',
    description: 'Label above the name of the picked room mode',
  },
  backLabel: {
    id: 'app.settings.roomMode.backLabel',
    description: 'Button that goes back to the room modes without keeping the edits',
  },
  applyChangesLabel: {
    id: 'app.settings.roomMode.applyChangesLabel',
    description: 'Button that keeps the edits made to a room mode and goes back to the modes',
  },
  fixedHeading: {
    id: 'app.settings.roomMode.fixedHeading',
    description: 'Heading of the room settings fixed for the session, shown disabled',
  },
  recordingAllowed: {
    id: 'app.settings.roomMode.fixed.recordingAllowed',
    description: 'Fixed room setting: the session can be recorded',
  },
  autoStartRecording: {
    id: 'app.settings.roomMode.fixed.autoStartRecording',
    description: 'Fixed room setting: the recording starts on its own',
  },
  breakoutRooms: {
    id: 'app.settings.roomMode.fixed.breakoutRooms',
    description: 'Fixed room setting: breakout rooms',
  },
  polls: {
    id: 'app.settings.roomMode.fixed.polls',
    description: 'Fixed room setting: polls',
  },
  reactions: {
    id: 'app.settings.roomMode.fixed.reactions',
    description: 'Fixed room setting: reactions',
  },
  virtualBackgrounds: {
    id: 'app.settings.roomMode.fixed.virtualBackgrounds',
    description: 'Fixed room setting: virtual backgrounds',
  },
  changed: {
    id: 'app.settings.roomMode.changed',
    description: 'Toast once the room mode was changed from the settings window',
  },
  changeFailed: {
    id: 'app.settings.roomMode.changeFailed',
    description: 'Toast when the room mode could not be changed from the settings window',
  },
  currentLabel: {
    id: 'app.settings.roomMode.currentLabel',
    description: 'Read out on the card of the room\'s current mode',
  },
});

// Element ids and data-test ids, apart from the pre-flight's.
const PREFIX = 'settingsRoomMode';
const HEADING_ID = `${PREFIX}Heading`;
const FIXED_HEADING_ID = `${PREFIX}FixedHeading`;

// The mode the moderator picked in the tab, with the edits kept for it.
export interface RoomModeChange {
  pick: string | null;
  edits: RoomModeEdits;
}

export type RoomModeApply = () => Promise<void>;

interface RoomModeTabProps {
  // The room's mode, as stored.
  currentMode: string;
  change: RoomModeChange;
  onChange: (change: RoomModeChange) => void;
  // Hands the settings window's footer the function that applies the change.
  registerApply: (apply: RoomModeApply | null) => void;
  onReadyChange: (ready: boolean) => void;
  // Whether a mode's settings are open: the footer applies nothing meanwhile,
  // since their edits are not kept until "Apply changes".
  onEditingChange: (editing: boolean) => void;
  applying: boolean;
}

// Whether two sets of edits end up applying the same settings.
const sameSettings = (
  mode: RoomModeDefinition,
  edits: RoomModeEdits,
  other: RoomModeEdits,
  roomValues: RoomModeRoomValues,
) => JSON.stringify(resolveRoomModeSettings(mode.preset, edits, roomValues))
  === JSON.stringify(resolveRoomModeSettings(mode.preset, other, roomValues));

/**
 * Whether the tab holds something to apply: another mode, or edits to the
 * current one. Picking the current mode again with nothing edited does nothing.
 */
export const isRoomModeChangePending = ({ pick, edits }: RoomModeChange, currentMode: string) => (
  pick !== null && (pick !== currentMode || Object.keys(edits).length > 0)
);

/**
 * The room modes tab: the same cards and summary as the pre-flight, in two
 * steps as the design draws them. The cards pick a mode; a mode's gear opens
 * its settings, where edits are kept or dropped. Nothing reaches the room
 * until the window's footer applies the change, over the room as it was
 * created (the previous mode does not stay).
 */
const RoomModeTab: React.FC<RoomModeTabProps> = ({
  currentMode,
  change,
  onChange,
  registerApply,
  onReadyChange,
  onEditingChange,
  applying,
}) => {
  const intl = useIntl();
  const { ready, apply } = useRoomModeApplier();
  const { base } = useRoomModeBase();
  const { data: meeting } = useMeeting((m) => ({
    usersPolicies: { guestPolicy: m.usersPolicies?.guestPolicy },
  }));
  const isBreakoutRoomsEnabled = useIsBreakoutRoomsEnabled();
  const isPollingEnabled = useIsPollingEnabled();
  const isReactionsEnabled = useIsReactionsEnabled();
  const isVirtualBackgroundsEnabled = useIsVirtualBackgroundsEnabled();
  // The mode whose settings are open, and the edits made there until kept.
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<RoomModeEdits>({});
  // Focus follows the step: the summary's title once a mode's settings open,
  // the gear they were opened from once they close.
  const summaryTitleRef = useRef<HTMLHeadingElement>(null);
  const lastEditedRef = useRef<RoomModeDefinition | null>(null);

  const recordingPolicies = meetingStaticData.getMeetingData()?.recordingPolicies;
  // What a setting the mode leaves out falls back to: the room as created.
  const roomValues = useMemo<RoomModeRoomValues>(() => {
    const values: RoomModeRoomValues = {
      record: recordingPolicies?.record ?? false,
      autoStartRecording: recordingPolicies?.autoStartRecording ?? false,
    };
    const guestPolicy = base?.usersPolicies.guestPolicy ?? meeting?.usersPolicies?.guestPolicy;
    if (guestPolicy) values.guestPolicy = guestPolicy;
    return values;
  }, [base, meeting?.usersPolicies?.guestPolicy, recordingPolicies]);

  const selectedId = change.pick ?? currentMode;

  useEffect(() => {
    onReadyChange(ready);
    return () => onReadyChange(false);
  }, [ready]);

  useEffect(() => {
    onEditingChange(editing !== null);
    if (editing !== null) {
      summaryTitleRef.current?.focus();
    } else if (lastEditedRef.current) {
      document.querySelector<HTMLElement>(
        `[data-test="${PREFIX}Edit${lastEditedRef.current.testId}"]`,
      )?.focus();
    }
  }, [editing]);

  useEffect(() => () => onEditingChange(false), []);

  useEffect(() => {
    registerApply(async () => {
      const mode = getRoomMode(change.pick);
      if (!mode) return;
      const settings = settingsToApply(mode, change.edits, roomValues);
      try {
        await apply(mode, settings);
      } catch (error) {
        logger.warn({
          logCode: 'room_mode_change_failed',
          extraInfo: { modeId: mode.id, error: (error as Error).message },
        }, 'Room mode not changed');
        notify(intl.formatMessage(intlMessages.changeFailed), 'error', 'settings');
        throw error;
      }
      logger.info({
        logCode: 'room_mode_changed',
        extraInfo: { modeId: mode.id, from: currentMode, settings },
      }, 'Room mode changed from the settings');
      notify(intl.formatMessage(intlMessages.changed, { 0: intl.formatMessage(mode.name) }), 'info', 'settings');
    });
    return () => registerApply(null);
  }, [change, roomValues, apply, currentMode]);

  const openSettings = (mode: RoomModeDefinition) => {
    lastEditedRef.current = mode;
    setDraft(mode.id === change.pick ? change.edits : {});
    setEditing(mode.id);
  };

  const heading = (
    <>
      <SubMenuStyled.Title id={HEADING_ID}>{intl.formatMessage(intlMessages.title)}</SubMenuStyled.Title>
      <SubMenuStyled.SubTitle>{intl.formatMessage(intlMessages.description)}</SubMenuStyled.SubTitle>
    </>
  );

  const editingMode = getRoomMode(editing);
  if (editingMode) {
    // The edits the pick already keeps for this mode: "Apply changes" is for
    // something new.
    const kept = editingMode.id === change.pick ? change.edits : {};
    const hasNewEdits = !sameSettings(editingMode, draft, kept, roomValues);
    const fixed = [
      { id: 'RecordingAllowed', label: intlMessages.recordingAllowed, value: roomValues.record },
      { id: 'AutoStartRecording', label: intlMessages.autoStartRecording, value: roomValues.autoStartRecording },
      { id: 'BreakoutRooms', label: intlMessages.breakoutRooms, value: isBreakoutRoomsEnabled },
      { id: 'Polls', label: intlMessages.polls, value: isPollingEnabled },
      { id: 'Reactions', label: intlMessages.reactions, value: isReactionsEnabled },
      { id: 'VirtualBackgrounds', label: intlMessages.virtualBackgrounds, value: isVirtualBackgroundsEnabled },
    ];

    return (
      <Styled.Tab data-test={`${PREFIX}Panel`}>
        {heading}
        <Styled.SummaryCard>
          <SubMenuStyled.Title as="h4" ref={summaryTitleRef} tabIndex={-1}>
            {intl.formatMessage(intlMessages.summaryTitle)}
          </SubMenuStyled.Title>
          <SubMenuStyled.SubTitle as="p">{intl.formatMessage(intlMessages.summaryDescription)}</SubMenuStyled.SubTitle>
          <RoomModeStyled.Selected>
            <RoomModeStyled.CardIcon aria-hidden $selected>
              <editingMode.icon />
            </RoomModeStyled.CardIcon>
            <RoomModeStyled.SelectedText>
              <RoomModeStyled.SelectedLabel>
                {intl.formatMessage(intlMessages.selectedLabel)}
              </RoomModeStyled.SelectedLabel>
              <Styled.SelectedName>{intl.formatMessage(editingMode.name)}</Styled.SelectedName>
            </RoomModeStyled.SelectedText>
          </RoomModeStyled.Selected>
          <RoomModeSummaryView
            mode={editingMode}
            roomValues={roomValues}
            edits={draft}
            onEdit={(id, value) => setDraft((previous) => ({ ...previous, [id]: value }))}
            locked={applying}
            prefix={PREFIX}
            extraGroup={(
              // Decided when the room was created: shown as they are, never as switches to flip.
              <SummaryStyled.Group role="group" aria-labelledby={FIXED_HEADING_ID}>
                <SummaryStyled.GroupHeading id={FIXED_HEADING_ID}>
                  <LockIcon aria-hidden />
                  {intl.formatMessage(intlMessages.fixedHeading)}
                </SummaryStyled.GroupHeading>
                <SummaryStyled.Controls $locked={false}>
                  {fixed.map((setting) => (
                    <BBBToggle
                      key={setting.id}
                      id={`${PREFIX}-fixed${setting.id}`}
                      checked={setting.value}
                      disabled
                      onChange={() => {}}
                      label={intl.formatMessage(setting.label)}
                      textPosition="left"
                      fullWidth
                      slotProps={{
                        input: {
                          'data-test': `${PREFIX}Fixed${setting.id}`,
                        } as React.InputHTMLAttributes<HTMLInputElement>,
                      }}
                    />
                  ))}
                </SummaryStyled.Controls>
              </SummaryStyled.Group>
            )}
          />
          <Styled.Actions>
            <BBButton
              variant="secondary"
              label={intl.formatMessage(intlMessages.backLabel)}
              onClick={() => setEditing(null)}
              dataTest={`${PREFIX}BackButton`}
            />
            <BBButton
              variant="primary"
              label={intl.formatMessage(intlMessages.applyChangesLabel)}
              disabled={applying || !hasNewEdits}
              onClick={() => {
                onChange({ pick: editingMode.id, edits: draft });
                setEditing(null);
              }}
              dataTest={`${PREFIX}ApplyChangesButton`}
            />
          </Styled.Actions>
        </Styled.SummaryCard>
      </Styled.Tab>
    );
  }

  return (
    <Styled.Tab data-test={`${PREFIX}Panel`}>
      {heading}
      <RoomModeCards
        selectedId={selectedId}
        // Another card starts from that mode's own values.
        onSelect={(modeId) => onChange({ pick: modeId, edits: modeId === change.pick ? change.edits : {} })}
        locked={applying}
        prefix={PREFIX}
        labelledBy={HEADING_ID}
        currentId={currentMode}
        currentLabel={intl.formatMessage(intlMessages.currentLabel)}
        renderCardAction={(mode) => (
          <BBButton
            layout="squared"
            icon={<SettingsIcon />}
            tooltipLabel={intl.formatMessage(intlMessages.editLabel, { 0: intl.formatMessage(mode.name) })}
            ariaLabel={intl.formatMessage(intlMessages.editLabel, { 0: intl.formatMessage(mode.name) })}
            variant="subtle"
            color="default"
            disabled={applying}
            onClick={() => openSettings(mode)}
            dataTest={`${PREFIX}Edit${mode.testId}`}
          />
        )}
      />
    </Styled.Tab>
  );
};

export default RoomModeTab;
