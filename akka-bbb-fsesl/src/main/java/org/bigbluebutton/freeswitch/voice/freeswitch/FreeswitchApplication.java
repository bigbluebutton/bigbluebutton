/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * <p>
 * Copyright (c) 2015 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.freeswitch.voice.freeswitch;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.BroadcastConferenceCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.EjectAllUsersCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.EjectUserCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.FreeswitchCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.GetAllUsersCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.MuteUserCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.DeafUserCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.HoldUserCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.PlaySoundCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.StopSoundCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.RecordConferenceCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.TransferUserToMeetingCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class FreeswitchApplication implements  IDelayedCommandListener{
  private static Logger log = LoggerFactory.getLogger(FreeswitchApplication.class);

  private static final int SENDERTHREADS = 1;
  private static final Executor msgSenderExec = Executors.newFixedThreadPool(SENDERTHREADS);
  private static final Executor runExec = Executors.newFixedThreadPool(SENDERTHREADS);
  private BlockingQueue<FreeswitchCommand> messages = new LinkedBlockingQueue<FreeswitchCommand>();

  private final ConnectionManager manager;
  private DelayedCommandSenderService delayedCommandSenderService;

  private final String USER = "0"; /* not used for now */

  private volatile boolean sendMessages = false;

  private final String audioProfile;

  public FreeswitchApplication(ConnectionManager manager, String profile) {
    this.manager = manager;
    this.audioProfile = profile;
    delayedCommandSenderService = new DelayedCommandSenderService();
    delayedCommandSenderService.setDelayedCommandListener(this);
  }

  public void runDelayedCommand(FreeswitchCommand command) {
    log.info("Run DelayedCommand.");
    queueMessage(command);
  }

  private void queueMessage(FreeswitchCommand command) {
    try {
      log.info("Queue message: " + command.getCommand() + " " + command.getCommandArgs());
      messages.offer(command, 5, TimeUnit.SECONDS);
    } catch (InterruptedException e) {
      // TODO Auto-generated catch block
      log.error("Exception queueing message: ", e);
    }
  }

  public void transferUserToMeeting(String voiceConfId,
                                    String targetVoiceConfId, String voiceUserId) {
    TransferUserToMeetingCommand tutmc = new TransferUserToMeetingCommand(
      voiceConfId, targetVoiceConfId, voiceUserId, this.audioProfile,
      USER);
    queueMessage(tutmc);
  }

  public void start() {
    delayedCommandSenderService.start();

    sendMessages = true;
    Runnable sender = new Runnable() {
      public void run() {
        while (sendMessages) {
          FreeswitchCommand message;
          try {
            message = messages.take();
            sendMessageToFreeswitch(message);
          } catch (InterruptedException e) {
            // TODO Auto-generated catch block
            log.error("Exception taking message from queue: ", e);
          }
        }
      }
    };
    msgSenderExec.execute(sender);
  }

  public void getUsersStatus(String voiceConfId, String meetingId) {
    GetUsersStatusCommand ccrc = new GetUsersStatusCommand(voiceConfId, meetingId);
    queueMessage(ccrc);
  }

  public void checkRunningAndRecording(String voiceConfId, String meetingId) {
    ConferenceCheckRecordCommand ccrc = new ConferenceCheckRecordCommand(voiceConfId, meetingId);
    queueMessage(ccrc);
  }

  public void getAllUsers(String voiceConfId) {
    GetAllUsersCommand prc = new GetAllUsersCommand(voiceConfId, USER);
    queueMessage(prc);
  }

  public void muteUser(String voiceConfId, String voiceUserId, Boolean mute) {
    MuteUserCommand mpc = new MuteUserCommand(voiceConfId, voiceUserId, mute, USER);
    queueMessage(mpc);
  }

  public void deafUser(String voiceConfId, String voiceUserId, Boolean deaf) {
    DeafUserCommand duc = new DeafUserCommand(voiceConfId, voiceUserId, deaf, USER);
    queueMessage(duc);
  }

  public void holdUser(String voiceConfId, String voiceUserId, Boolean hold) {
    HoldUserCommand huc = new HoldUserCommand(voiceConfId, voiceUserId, hold, USER);
    queueMessage(huc);
  }

  public void playSound(String voiceConfId, String voiceUserId, String soundPath) {
    PlaySoundCommand psc = new PlaySoundCommand(voiceConfId, voiceUserId, soundPath, USER);
    queueMessage(psc);
  }

  public void stopSound(String voiceConfId, String voiceUserId) {
    StopSoundCommand ssc = new StopSoundCommand(voiceConfId, voiceUserId, USER);
    queueMessage(ssc);
  }

  public void eject(String voiceConfId, String voiceUserId) {
    EjectUserCommand mpc = new EjectUserCommand(voiceConfId, voiceUserId, USER);
    queueMessage(mpc);
  }

  public void ejectAll(String voiceConfId) {
    EjectAllUsersCommand mpc = new EjectAllUsersCommand(voiceConfId, USER);
    queueMessage(mpc);
  }

  private Long genTimestamp() {
    return TimeUnit.NANOSECONDS.toMillis(System.nanoTime());
  }

  public void startRecording(String voiceConfId, String meetingid, String voicePath) {
    RecordConferenceCommand rcc = new RecordConferenceCommand(voiceConfId, USER, true, voicePath);
    queueMessage(rcc);
  }

  public void stopRecording(String voiceConfId, String meetingid, String voicePath) {
    RecordConferenceCommand rcc = new RecordConferenceCommand(voiceConfId, USER, false, voicePath);
    queueMessage(rcc);
  }

  private void sendMessageToFreeswitch(final FreeswitchCommand command) {
    Runnable task = new Runnable() {
      public void run() {
        log.info("Sending message: " + command.getCommand() + " " + command.getCommandArgs());
        try {
          if (command instanceof GetAllUsersCommand) {
            GetAllUsersCommand cmd = (GetAllUsersCommand) command;
            manager.getUsers(cmd);
          } else if (command instanceof MuteUserCommand) {
            MuteUserCommand cmd = (MuteUserCommand) command;
            manager.mute(cmd);
          } else if (command instanceof DeafUserCommand) {
            DeafUserCommand cmd = (DeafUserCommand) command;
            manager.deaf(cmd);
          } else if (command instanceof HoldUserCommand) {
            HoldUserCommand cmd = (HoldUserCommand) command;
            manager.hold(cmd);
          } else if (command instanceof PlaySoundCommand) {
            PlaySoundCommand cmd = (PlaySoundCommand) command;
            manager.playSound(cmd);
          } else if (command instanceof StopSoundCommand) {
            StopSoundCommand cmd = (StopSoundCommand) command;
            manager.stopSound(cmd);
          } else if (command instanceof EjectUserCommand) {
            EjectUserCommand cmd = (EjectUserCommand) command;
            manager.eject(cmd);
          } else if (command instanceof EjectAllUsersCommand) {
            EjectAllUsersCommand cmd = (EjectAllUsersCommand) command;
            manager.ejectAll(cmd);

            CheckIfConfIsRunningCommand command = new CheckIfConfIsRunningCommand(cmd.getRoom(),
                    cmd.getRequesterId(),
                    delayedCommandSenderService, 0);
            delayedCommandSenderService.handleMessage(command, 5000);
          } else if (command instanceof TransferUserToMeetingCommand) {
            TransferUserToMeetingCommand cmd = (TransferUserToMeetingCommand) command;
            manager.tranfer(cmd);
          } else if (command instanceof RecordConferenceCommand) {
            manager.record((RecordConferenceCommand) command);
          } else if (command instanceof BroadcastConferenceCommand) {
            manager.broadcast((BroadcastConferenceCommand) command);
          } else if (command instanceof ConferenceCheckRecordCommand) {
            manager.checkIfConferenceIsRecording((ConferenceCheckRecordCommand) command);
          } else if (command instanceof CheckIfConfIsRunningCommand) {
            manager.checkIfConfIsRunningCommand((CheckIfConfIsRunningCommand) command);
          } else if (command instanceof ForceEjectUserCommand) {
            manager.forceEjectUser((ForceEjectUserCommand) command);
          } else if (command instanceof GetUsersStatusCommand) {
            manager.getUsersStatus((GetUsersStatusCommand) command);
          }
        } catch (RuntimeException e) {
          log.warn(e.getMessage());
        }
      }
    };

    runExec.execute(task);
  }

  public void stop() {
    delayedCommandSenderService.stop();

    sendMessages = false;
  }

}
