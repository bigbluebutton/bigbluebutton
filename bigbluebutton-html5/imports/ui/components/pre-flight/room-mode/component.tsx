import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import Styled from './styles';
import ProfileStyled from '/imports/ui/components/profile-settings/styles';
import { usePreFlight } from '../context';
import { JoiningRoomActions } from '../joining-room/component';
import JoinNotices from '../join-notices/component';
import ROOM_MODES, { getRoomMode } from './modes';
import RoomIllustration from './illustration';
import RoomModeSummary from './summary/component';
import { RoomModeRoomValues } from './settings';

const intlMessages = defineMessages({
  title: {
    id: 'app.preFlight.roomMode.title',
    description: 'Title of the room mode panel, beside the setup panel',
  },
  heading: {
    id: 'app.preFlight.roomMode.heading',
    description: 'Heading above the room mode cards',
  },
  description: {
    id: 'app.preFlight.roomMode.description',
    description: 'Description under the room mode heading',
  },
  emptyState: {
    id: 'app.preFlight.roomMode.emptyState',
    description: 'Shown beside the room mode cards until one is picked',
  },
  summaryTitle: {
    id: 'app.preFlight.roomMode.summary.title',
    description: 'Title of the summary of what the picked room mode applies',
  },
  selectedLabel: {
    id: 'app.preFlight.roomMode.selectedLabel',
    description: 'Label above the name of the picked room mode',
  },
  startLabel: {
    id: 'app.preFlight.roomMode.startLabel',
    description: 'Label of the button that starts the room from the room mode panel',
  },
  cancelLabel: {
    id: 'app.preFlight.roomMode.cancelLabel',
    description: 'Label of the button that clears the picked room mode',
  },
});

const HEADING_ID = 'preFlightRoomModeHeading';

const cardId = (modeId: string) => `preFlightRoomMode-${modeId}`;

const focusCard = (modeId: string) => document.getElementById(cardId(modeId))?.focus();

interface RoomModePanelProps {
  // Once Start room is pressed the pick is final: the cards stop taking input.
  isJoining: boolean;
  // The room's current values for what a mode leaves as created.
  roomValues: RoomModeRoomValues;
}

/**
 * The room mode cards for a moderator entering a room with no mode. The pick
 * only lives in the pre-flight's state: applying it to the room happens after
 * the join, and starting without one leaves the room as it was created.
 */
export const RoomModePanel: React.FC<RoomModePanelProps> = ({ isJoining, roomValues }) => {
  const intl = useIntl();
  // In the phone layout the tab already names the panel.
  const { roomMode, setRoomMode, phoneLayout } = usePreFlight();
  const selected = getRoomMode(roomMode);
  // Roving focus, as a radio group: one tab stop, arrows move between the
  // cards.
  const focusableId = selected?.id ?? ROOM_MODES[0].id;

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = {
      ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1,
    }[event.key];
    if (!step || isJoining) return;
    event.preventDefault();
    const modes = ROOM_MODES;
    const current = modes.findIndex((mode) => mode.id === focusableId);
    const next = modes[(current + step + modes.length) % modes.length];
    setRoomMode(next.id);
    focusCard(next.id);
  }, [focusableId, setRoomMode, isJoining]);

  return (
    <Styled.Panel data-test="preFlightRoomModePanel">
      {!phoneLayout && (
        <>
          <Styled.Title>{intl.formatMessage(intlMessages.title)}</Styled.Title>
          <ProfileStyled.Separator />
        </>
      )}
      <Styled.Body>
        <Styled.Picker>
          <Styled.Heading id={HEADING_ID}>{intl.formatMessage(intlMessages.heading)}</Styled.Heading>
          <Styled.Description>{intl.formatMessage(intlMessages.description)}</Styled.Description>
          <Styled.Cards
            role="radiogroup"
            aria-labelledby={HEADING_ID}
            aria-disabled={isJoining || undefined}
            onKeyDown={handleKeyDown}
          >
            {ROOM_MODES.map((mode) => {
              const isSelected = mode.id === selected?.id;
              const Icon = mode.icon;

              // Not disabled while joining, only locked: a disabled card would
              // leave the tab order and stop announcing the pick.
              return (
                <Styled.Card
                  key={mode.id}
                  id={cardId(mode.id)}
                  role="radio"
                  aria-checked={isSelected}
                  aria-disabled={isJoining || undefined}
                  tabIndex={mode.id === focusableId ? 0 : -1}
                  $selected={isSelected}
                  onClick={() => { if (!isJoining) setRoomMode(mode.id); }}
                  data-test={mode.dataTest}
                >
                  <Styled.CardIcon aria-hidden $selected={isSelected}>
                    <Icon />
                  </Styled.CardIcon>
                  <Styled.CardText>
                    <Styled.CardName>
                      {intl.formatMessage(mode.name)}
                      {isSelected && <CheckCircleIcon aria-hidden />}
                    </Styled.CardName>
                    <Styled.CardHint>{intl.formatMessage(mode.hint)}</Styled.CardHint>
                  </Styled.CardText>
                </Styled.Card>
              );
            })}
          </Styled.Cards>
        </Styled.Picker>
        {/* No live region: the checked radio already announces the pick. */}
        <Styled.Summary $empty={!selected}>
          {selected && (
            <Styled.SummaryTitle>{intl.formatMessage(intlMessages.summaryTitle)}</Styled.SummaryTitle>
          )}
          {selected ? (
            <Styled.Selected data-test="preFlightRoomModeSelected">
              <Styled.CardIcon aria-hidden $selected>
                <selected.icon />
              </Styled.CardIcon>
              <Styled.SelectedText>
                <Styled.SelectedLabel>{intl.formatMessage(intlMessages.selectedLabel)}</Styled.SelectedLabel>
                <Styled.SelectedName>{intl.formatMessage(selected.name)}</Styled.SelectedName>
              </Styled.SelectedText>
            </Styled.Selected>
          ) : (
            <>
              <RoomIllustration />
              <Styled.EmptyState data-test="preFlightRoomModeEmptyState">
                {intl.formatMessage(intlMessages.emptyState)}
              </Styled.EmptyState>
            </>
          )}
          {selected && <RoomModeSummary mode={selected} roomValues={roomValues} isJoining={isJoining} />}
        </Styled.Summary>
      </Styled.Body>
    </Styled.Panel>
  );
};

interface RoomModeActionsProps {
  isJoining: boolean;
  onJoin: () => void;
}

// The panel's footer. Kept apart from the panel so a phone, where the panels
// become tabs, still shows it under both.
export const RoomModeActions: React.FC<RoomModeActionsProps> = ({ isJoining, onJoin }) => {
  const intl = useIntl();
  // The phone layout pins the actions to the bottom of the screen: the notices
  // stay in the header there, and the design leaves Cancel out.
  const { roomMode, setRoomMode, phoneLayout } = usePreFlight();

  // Cancel goes away with the selection, so focus moves to the cards' tab stop
  // rather than falling back to the page.
  const handleCancel = useCallback(() => {
    setRoomMode(null);
    focusCard(ROOM_MODES[0].id);
  }, [setRoomMode]);

  return (
    <>
      {!phoneLayout && <JoinNotices />}
      <JoiningRoomActions
        isJoining={isJoining}
        onJoin={onJoin}
        label={intlMessages.startLabel}
        secondaryAction={roomMode && !isJoining && !phoneLayout ? (
          <BBButton
            variant="subtle"
            label={intl.formatMessage(intlMessages.cancelLabel)}
            onClick={handleCancel}
            dataTest="preFlightRoomModeCancelButton"
          />
        ) : null}
      />
    </>
  );
};

export default RoomModePanel;
