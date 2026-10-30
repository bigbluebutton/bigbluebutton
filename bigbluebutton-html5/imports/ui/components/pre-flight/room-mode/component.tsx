import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import Styled from './styles';
import ProfileStyled from '/imports/ui/components/profile-settings/styles';
import { usePreFlight } from '../context';
import { JoiningRoomActions } from '../joining-room/component';
import JoinNotices from '../join-notices/component';
import ROOM_MODES, { getRoomMode, RoomModeDefinition } from './modes';
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

// The pre-flight's prefix, for both element ids and data-test ids.
const PRE_FLIGHT_PREFIX = 'preFlightRoomMode';

const HEADING_ID = `${PRE_FLIGHT_PREFIX}Heading`;

const cardId = (prefix: string, modeId: string) => `${prefix}-${modeId}`;

const focusCard = (prefix: string, modeId: string) => document.getElementById(cardId(prefix, modeId))?.focus();

interface RoomModeCardsProps {
  selectedId: string | null;
  onSelect: (modeId: string) => void;
  // Once the pick is being applied the cards stop taking input.
  locked: boolean;
  // Element ids and data-test ids start with it, so two places can list the modes.
  prefix: string;
  labelledBy: string;
  // The room's mode, marked on its card.
  currentId?: string;
  // Read out on the current mode's card, which the check may have left.
  currentLabel?: string;
  // Rendered beside each card, outside it: a card is a radio.
  renderCardAction?: (mode: RoomModeDefinition) => React.ReactNode;
}

/**
 * The mode cards, as a radio group. The pick belongs to the caller: the
 * pre-flight's state, or the in-meeting settings window.
 */
export const RoomModeCards: React.FC<RoomModeCardsProps> = ({
  selectedId,
  onSelect,
  locked,
  prefix,
  labelledBy,
  currentId,
  currentLabel,
  renderCardAction,
}) => {
  const intl = useIntl();
  const selected = getRoomMode(selectedId);
  // Roving focus, as a radio group: one tab stop, arrows move between the
  // cards.
  const focusableId = selected?.id ?? ROOM_MODES[0].id;

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = {
      ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1,
    }[event.key];
    // Only the cards move the pick: a card's action has keys of its own.
    if (!step || locked || (event.target as HTMLElement).getAttribute('role') !== 'radio') return;
    event.preventDefault();
    const modes = ROOM_MODES;
    const current = modes.findIndex((mode) => mode.id === focusableId);
    const next = modes[(current + step + modes.length) % modes.length];
    onSelect(next.id);
    focusCard(prefix, next.id);
  }, [focusableId, onSelect, locked, prefix]);

  return (
    <Styled.Cards
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-disabled={locked || undefined}
      onKeyDown={handleKeyDown}
    >
      {ROOM_MODES.map((mode) => {
        const isSelected = mode.id === selected?.id;
        const isCurrent = currentId !== undefined && mode.id === currentId;
        const Icon = mode.icon;

        // Not disabled while locked: a disabled card would leave the tab order
        // and stop announcing the pick.
        const card = (
          <Styled.Card
            key={mode.id}
            id={cardId(prefix, mode.id)}
            role="radio"
            aria-checked={isSelected}
            aria-disabled={locked || undefined}
            tabIndex={mode.id === focusableId ? 0 : -1}
            $selected={isSelected}
            onClick={() => { if (!locked) onSelect(mode.id); }}
            data-test={`${prefix}${mode.testId}`}
            data-current={currentId === undefined ? undefined : isCurrent}
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
              {isCurrent && currentLabel && <span className="sr-only">{currentLabel}</span>}
            </Styled.CardText>
          </Styled.Card>
        );

        return renderCardAction ? (
          <Styled.CardRow key={mode.id}>
            {card}
            {renderCardAction(mode)}
          </Styled.CardRow>
        ) : card;
      })}
    </Styled.Cards>
  );
};

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
          <RoomModeCards
            selectedId={roomMode}
            onSelect={setRoomMode}
            locked={isJoining}
            prefix={PRE_FLIGHT_PREFIX}
            labelledBy={HEADING_ID}
          />
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
    focusCard(PRE_FLIGHT_PREFIX, ROOM_MODES[0].id);
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
