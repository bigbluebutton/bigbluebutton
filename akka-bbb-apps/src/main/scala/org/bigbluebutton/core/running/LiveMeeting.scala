package org.bigbluebutton.core.running

import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.core.apps._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core2.MeetingStatus2x

import java.util

class LiveMeeting(
    val props:               DefaultProps,
    val status:              MeetingStatus2x,
    val screenshareModel:    ScreenshareModel,
    val audioCaptions:       AudioCaptions,
    val timerModel:          TimerModel,
    val chatModel:           ChatModel,
    val externalVideoModel:  ExternalVideoModel,
    val layouts:             Layouts,
    val pads:                Pads,
    val registeredUsers:     RegisteredUsers,
    val polls:               Polls, // 2x
    val wbModel:             WhiteboardModel,
    val presModel:           PresentationModel,
    val webcams:             Webcams,
    val voiceUsers:          VoiceUsers,
    val users2x:             Users2x,
    val guestsWaiting:       GuestsWaiting,
    val clientSettings:      Map[String, Object],
)
