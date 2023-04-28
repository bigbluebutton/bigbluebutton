import { useSubscription } from "@apollo/client";
import React from "react";
import { defineMessages, useIntl } from 'react-intl';
import {
    TALKING_INDICATOR_SUBSCRIPTION,
    MEETING_IS_BREAKOUT,
} from "../queries";
import Service from '../talking-indicator/service';
import Styled from './styles';
import { Meteor } from 'meteor/meteor';
import SpeechService from '/imports/ui/components/audio/captions/speech/service';
import { debounce } from "radash";
import { TalkingIndicatorProps } from "/imports/ui/Types/talking-indicator";
import { uniqueId } from '/imports/utils/string-utils';
import { CurrentUser } from "/imports/api/users";

const intlMessages = defineMessages({
    wasTalking: {
        id: 'app.talkingIndicator.wasTalking',
        description: 'aria label for user who is not talking but still visible',
    },
    isTalking: {
        id: 'app.talkingIndicator.isTalking',
        description: 'aria label for user currently talking',
    },
    ariaMuteDesc: {
        id: 'app.talkingIndicator.ariaMuteDesc',
        description: 'aria description for muting a user',
    },
    muteLabel: {
        id: 'app.actionsBar.muteLabel',
        description: 'indicator mute label for moderators',
    },
    moreThanMaxIndicatorsTalking: {
        id: 'app.talkingIndicator.moreThanMaxIndicatorsTalking',
        description: 'indicator label for all users who is talking but not visible',
    },
    moreThanMaxIndicatorsWereTalking: {
        id: 'app.talkingIndicator.moreThanMaxIndicatorsWereTalking',
        description: 'indicator label for all users who is not talking but not visible',
    },
});

const TALKING_INDICATORS_MAX = 8;
const TALKING_INDICATOR_MUTE_INTERVAL = 500;

const isBreakoutRoom = MEETING_IS_BREAKOUT;
const PUBLIC_CONFIG = Meteor.settings.public;
const ROLE_MODERATOR = PUBLIC_CONFIG.user.role_moderator;
const amIModerator = CurrentUser.role === ROLE_MODERATOR;

const TalkingIndicator: React.FC<TalkingIndicatorProps> = ({
    moreThanMaxIndicators,
    talkers,
}) => {

    const intl = useIntl();

    const handleMuteUser = (id) => {
        if (!amIModerator || isBreakoutRoom) return;
        handleMuteUser(id);
    }

    const talkingUserElements = Object.keys(talkers).map((id) => {
        const {
            talking,
            color,
            transcribing,
            floor,
            muted,
            name,
        } = talkers[id];

        const ariaLabel = intl.formatMessage(talking
            ? intlMessages.isTalking : intlMessages.wasTalking, {
            0: name,
        });

        let icon = talking ? 'unmute' : 'blank';
        icon = muted ? 'mute' : icon;

        return (
            <Styled.TalkingIndicatorWrapper
                key={uniqueId(`${name}-`)}
                muted={muted}
                talking={talking}
                floor={floor}
            >
                {transcribing && (
                    <Styled.CCIcon
                        iconName={muted ? 'closed_caption_stop' : 'closed_caption'}
                        muted={muted}
                        talking={talking}
                    />
                )}
                <Styled.TalkingIndicatorButton
                    $spoke={!talking || undefined}
                    $muted={muted}
                    $isViewer={!amIModerator || undefined}
                    key={uniqueId(`${name}-`)}
                    onClick={() => this.handleMuteUser(id)}
                    label={name}
                    tooltipLabel={!muted && amIModerator
                        ? `${intl.formatMessage(intlMessages.muteLabel)} ${name}`
                        : null}
                    data-test={talking ? 'isTalking' : 'wasTalking'}
                    aria-label={ariaLabel}
                    aria-describedby={talking ? 'description' : null}
                    color="primary"
                    icon={icon}
                    size="lg"
                    style={{
                        backgroundColor: color,
                        border: `solid 2px ${color}`,
                    }}
                >
                    {talking ? (
                        <Styled.Hidden id="description">
                            {`${intl.formatMessage(intlMessages.ariaMuteDesc)}`}
                        </Styled.Hidden>
                    ) : null}
                </Styled.TalkingIndicatorButton>
            </Styled.TalkingIndicatorWrapper>
        )
    });


    const maxIndicator = () => {
        if (!moreThanMaxIndicators) return null;

        const nobodyTalking = Service.nobodyTalking(talkers);

        const { moreThanMaxIndicatorsTalking, moreThanMaxIndicatorsWereTalking } = intlMessages;

        const ariaLabel = intl.formatMessage(nobodyTalking
            ? moreThanMaxIndicatorsWereTalking : moreThanMaxIndicatorsTalking, {
            0: Object.keys(talkers).length,
        });

        return (
            <Styled.TalkingIndicatorButton
                $spoke={nobodyTalking}
                $muted={false}
                $isViewer={false}
                key={uniqueId('_has__More_')}
                onClick={() => { }} // maybe add a dropdown to show the rest of the users
                label="..."
                tooltipLabel={ariaLabel}
                aria-label={ariaLabel}
                color="primary"
                size="sm"
                style={{
                    backgroundColor: '#4a148c',
                    border: 'solid 2px #4a148c',
                    cursor: 'default',
                }}
            />
        );
    };

    return (
        <Styled.IsTalkingWrapper data-test="talkingIndicator">
            <Styled.Speaking>
                {talkingUserElements}
                {maxIndicator()}
            </Styled.Speaking>
        </Styled.IsTalkingWrapper>
    );
}
const TalkingIndicatorContainer: React.FC = () => {
    const talkers = {};
    const limit = TALKING_INDICATORS_MAX + 1;

    const { loading: usersTalkingLoading, error: usersTalkingError, data: usersTalkingData } = useSubscription(TALKING_INDICATOR_SUBSCRIPTION, {
        variables: {
            limit,
        },
    });
    const { user_voice: usersTalking } = (usersTalkingData || {})

    if (usersTalking) {

        const maxNumberVoiceUsersNotification = usersTalking.length < TALKING_INDICATORS_MAX
            ? usersTalking.length
            : TALKING_INDICATORS_MAX

        for (let i = 0; i < maxNumberVoiceUsersNotification; i += 1) {
            const name = usersTalking[i].user.name;
            const userId = usersTalking[i].user.userId;
            const color = usersTalking[i].user.color;
            const {
                talking, floor, muted,
            } = usersTalking[i];

            talkers[`${userId}`] = {
                color,
                transcribing: SpeechService.hasSpeechLocale(userId),
                floor,
                talking,
                muted,
                name,
            };
        }
    }

    const muteUser = debounce({ delay: TALKING_INDICATOR_MUTE_INTERVAL }, (id) => {
        const user = usersTalkingData.filter(userTalking => userTalking.userId === id)
    });

    return <>
        <TalkingIndicator
            talkers={talkers}
            muteUser={muteUser}
            isBreakoutRoom={MEETING_IS_BREAKOUT}
            moreThanMaxIndicators={talkers.length > TALKING_INDICATORS_MAX}
        />
    </>
}

export default TalkingIndicatorContainer;