/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * <p>
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 * <p>
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * <p>
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * <p>
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 */
package org.bigbluebutton.freeswitch.voice;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import org.bigbluebutton.freeswitch.voice.events.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class FreeswitchConferenceEventListener implements ConferenceEventListener {
  private static Logger log = LoggerFactory.getLogger(FreeswitchConferenceEventListener.class);

  private static final int SENDERTHREADS = 1;
  private static final Executor msgSenderExec = Executors.newFixedThreadPool(SENDERTHREADS);
  private static final Executor runExec = Executors.newFixedThreadPool(SENDERTHREADS);
  private BlockingQueue<VoiceConferenceEvent> messages = new LinkedBlockingQueue<VoiceConferenceEvent>();

  private volatile boolean sendMessages = false;
  private final IVoiceConferenceService vcs;

  public FreeswitchConferenceEventListener(IVoiceConferenceService vcs) {
    this.vcs = vcs;
  }

  private void queueMessage(VoiceConferenceEvent event) {
    try {
      messages.offer(event, 5, TimeUnit.SECONDS);
    } catch (InterruptedException e) {
      // TODO Auto-generated catch block
      log.error("Exception queueing message: ", e);
    }
  }

  private void sendMessageToBigBlueButton(final VoiceConferenceEvent event) {
    Runnable task = new Runnable() {
      public void run() {
        if (event instanceof VoiceUserJoinedEvent) {
          VoiceUserJoinedEvent evt = (VoiceUserJoinedEvent) event;
          vcs.userJoinedVoiceConf(evt.getRoom(), evt.getVoiceUserId(), evt.getUserId(), evt.getCallerIdName(),
            evt.getCallerIdNum(), evt.getMuted(), evt.getSpeaking(), evt.getCallingWith(),
            evt.getHold(),
            evt.getUUID());
        } else if (event instanceof ChannelHoldChangedEvent) {
          ChannelHoldChangedEvent evt = (ChannelHoldChangedEvent) event;
          vcs.channelHoldChanged(
            evt.getRoom(),
            evt.getUserId(),
            evt.getUUID(),
            evt.isHeld()
          );
        }  else if (event instanceof VoiceConfRunningEvent) {
          VoiceConfRunningEvent evt = (VoiceConfRunningEvent) event;
          vcs.voiceConfRunning(evt.getRoom(), evt.isRunning());
        } else if (event instanceof VoiceUserLeftEvent) {
          VoiceUserLeftEvent evt = (VoiceUserLeftEvent) event;
          vcs.userLeftVoiceConf(evt.getRoom(), evt.getUserId());
        } else if (event instanceof VoiceUserMutedEvent) {
          VoiceUserMutedEvent evt = (VoiceUserMutedEvent) event;
          vcs.userMutedInVoiceConf(evt.getRoom(), evt.getUserId(), evt.isMuted());
        } else if (event instanceof VoiceUserTalkingEvent) {
          VoiceUserTalkingEvent evt = (VoiceUserTalkingEvent) event;
          vcs.userTalkingInVoiceConf(evt.getRoom(), evt.getUserId(), evt.isTalking());
        } else if (event instanceof VoiceStartRecordingEvent) {
          VoiceStartRecordingEvent evt = (VoiceStartRecordingEvent) event;
          vcs.voiceConfRecordingStarted(evt.getRoom(), evt.getRecordingFilename(), evt.startRecord(), evt.getTimestamp());
        } else if (event instanceof AudioFloorChangedEvent) {
          AudioFloorChangedEvent evt = (AudioFloorChangedEvent) event;
          vcs.audioFloorChanged(
            evt.getRoom(),
            evt.getVoiceUserId(),
            evt.getOldVoiceUserId(),
            evt.getFloorTimestamp()
          );
        } else if (event instanceof VoiceConfRunningAndRecordingEvent) {
          VoiceConfRunningAndRecordingEvent evt = (VoiceConfRunningAndRecordingEvent) event;
          if (evt.running && ! evt.recording) {
            log.warn("Voice conf running but not recording. conf=" + evt.getRoom()
                    + ",running=" + evt.running
                    + ",rec=" + evt.recording);
          }

          vcs.voiceConfRunningAndRecording(evt.getRoom(), evt.running, evt.recording, evt.confRecordings);
        } else if (event instanceof VoiceUsersStatusEvent) {
          VoiceUsersStatusEvent evt = (VoiceUsersStatusEvent) event;
          vcs.voiceUsersStatus(evt.getRoom(), evt.confMembers, evt.confRecordings);
        } else if (event instanceof VoiceCallStateEvent) {
          VoiceCallStateEvent evt = (VoiceCallStateEvent) event;
          vcs.voiceCallStateEvent(evt.getRoom(),
                  evt.callSession,
                  evt.clientSession,
                  evt.userId,
                  evt.getVoiceUserId(),
                  evt.callerName,
                  evt.callState,
                  evt.origCallerIdName,
                  evt.origCalledDest);
        } else if (event instanceof FreeswitchStatusReplyEvent) {
          FreeswitchStatusReplyEvent evt = (FreeswitchStatusReplyEvent) event;
          vcs.freeswitchStatusReplyEvent(evt.sendCommandTimestamp,
                  evt.status,
                  evt.receivedResponseTimestamp);
        } else if (event instanceof FreeswitchHeartbeatEvent) {
          FreeswitchHeartbeatEvent hbearEvt = (FreeswitchHeartbeatEvent) event;
          vcs.freeswitchHeartbeatEvent(hbearEvt.heartbeat);
        }

      }
    };

    runExec.execute(task);
  }

  public void start() {
    sendMessages = true;
    Runnable sender = new Runnable() {
      public void run() {
        while (sendMessages) {
          VoiceConferenceEvent message;
          try {
            message = messages.take();
            sendMessageToBigBlueButton(message);
          } catch (InterruptedException e) {
            // TODO Auto-generated catch block
            log.error("Exception taking message form queue: ", e);
          }
        }
      }
    };
    msgSenderExec.execute(sender);
  }

  public void stop() {
    sendMessages = false;
  }

  public void handleConferenceEvent(VoiceConferenceEvent event) {
    queueMessage(event);
  }

}
