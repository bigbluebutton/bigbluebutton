/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.freeswitch.voice.freeswitch;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import org.bigbluebutton.freeswitch.voice.events.ConferenceEventListener;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.BroadcastConferenceCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.EjectAllUsersCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.EjectUserCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.GetAllUsersCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.MuteUserCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.RecordConferenceCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.TransferUserToMeetingCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.*;
import org.freeswitch.esl.client.inbound.Client;
import org.freeswitch.esl.client.inbound.InboundConnectionFailure;
import org.freeswitch.esl.client.manager.ManagerConnection;
import org.freeswitch.esl.client.transport.CommandResponse;
import org.freeswitch.esl.client.transport.message.EslMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ConnectionManager {
	private static Logger log = LoggerFactory.getLogger(ConnectionManager.class);

	private static final String EVENT_NAME = "Event-Name";

	private static final ScheduledExecutorService connExec = Executors
			.newSingleThreadScheduledExecutor();

	private final ManagerConnection manager;
	private ScheduledFuture<ConnectThread> connectTask;

	private volatile boolean subscribed = false;

	private final ConferenceEventListener conferenceEventListener;
	private final ESLEventListener eslEventListener;

	private long lastStatusCheck = 0L;

	public ConnectionManager(ManagerConnection connManager,
			ESLEventListener eventListener, ConferenceEventListener confListener) {
		this.manager = connManager;
		this.eslEventListener = eventListener;
		this.conferenceEventListener = confListener;
		// Set up listener here. Before it was inside connect()
		// but on auto-reconnect, another listener is added
		// increasing the number of listeners causing duplicate
		// messages to akka-apps (ralam Oct 10, 2019)
		Client c = manager.getESLClient();
		c.addEventListener(eslEventListener);
	}

	private void connect() {
		//log.info("Connecting to FS ESL");
		try {
			Client c = manager.getESLClient();
			if (!c.canSend()) {
				log.info("Attempting to connect to FreeSWITCH ESL");
				subscribed = false;
				manager.connect();
			} else {
				if (!subscribed) {
					log.info("Subscribing for ESL events.");
					c.cancelEventSubscriptions();
					CommandResponse response = c.setEventSubscriptions("plain", "all");
					if (response.isOk()) {
						log.info("Subscribed to ESL events." +
								" Command: [" + response.getCommand() + "] " +
								" Response: [" + response.getReplyText() + "]");
					}

					c.addEventFilter(EVENT_NAME, "HEARTBEAT");
					//c.addEventFilter(EVENT_NAME, "custom");
					//c.addEventFilter(EVENT_NAME, "background_job");
					c.addEventFilter(EVENT_NAME, "CHANNEL_EXECUTE");
					c.addEventFilter(EVENT_NAME, "CHANNEL_STATE");
					subscribed = true;
				} else {
					// Let's check for status every minute.
					Long now = System.currentTimeMillis();
					if ((now - lastStatusCheck) > 60000) {
						lastStatusCheck = now;
						CheckFreeswitchStatusCommand fsStatusCmd = new CheckFreeswitchStatusCommand("foo", "bar");
						checkFreeswitchStatus(fsStatusCmd);
					}
				}
			}
		} catch (InboundConnectionFailure e) {
			log.error("Failed to connect to ESL");
		} catch(Exception e) {
			log.error(e.getMessage());
		}
	}

	public void start() {
		log.info("Starting FreeSWITCH ESL connection manager.");
		ConnectThread connector = new ConnectThread();
		connectTask = (ScheduledFuture<ConnectThread>) connExec
				.scheduleAtFixedRate(connector, 5, 5, TimeUnit.SECONDS);
	}

	public void stop() {
		log.info("Stopping FreeSWITCH ESL connection manager.");
		if (connectTask != null) {
			log.info("Cancelling connect task.");
			connectTask.cancel(true);
		}
	}

	private class ConnectThread implements Runnable {
		public void run() {
			connect();
		}
	}

	public void broadcast(BroadcastConferenceCommand rcc) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
			EslMessage response = c.sendSyncApiCommand(rcc.getCommand(),
					rcc.getCommandArgs());
			rcc.handleResponse(response, conferenceEventListener);
		}
	}

	public void getUsersStatus(GetUsersStatusCommand prc) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
			EslMessage response = c.sendSyncApiCommand(prc.getCommand(),
					prc.getCommandArgs());
			prc.handleResponse(response, conferenceEventListener);
		}
	}

	public void getUsers(GetAllUsersCommand prc) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
			EslMessage response = c.sendSyncApiCommand(prc.getCommand(),
					prc.getCommandArgs());
			prc.handleResponse(response, conferenceEventListener);
		}
	}

	public void checkIfConfIsRunningCommand(CheckIfConfIsRunningCommand command) {
		log.info("Sending CheckIfConfIsRunningCommand to FreeSWITCH");
    Client c = manager.getESLClient();
    if (c.canSend()) {
      EslMessage response = c.sendSyncApiCommand(command.getCommand(),
        command.getCommandArgs());
      command.handleResponse(response, conferenceEventListener);
    }
  }

	public void checkFreeswitchStatus(CheckFreeswitchStatusCommand ccrc) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
			EslMessage response = c.sendSyncApiCommand(ccrc.getCommand(),
					ccrc.getCommandArgs());
			ccrc.handleResponse(response, conferenceEventListener);
		}
	}

	public void forceEjectUser(ForceEjectUserCommand ccrc) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
			EslMessage response = c.sendSyncApiCommand(ccrc.getCommand(),
					ccrc.getCommandArgs());
			ccrc.handleResponse(response, conferenceEventListener);
		}
	}

	public void checkIfConferenceIsRecording(ConferenceCheckRecordCommand ccrc) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
			EslMessage response = c.sendSyncApiCommand(ccrc.getCommand(),
				ccrc.getCommandArgs());
			ccrc.handleResponse(response, conferenceEventListener);
		}
	}

	public void mute(MuteUserCommand mpc) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
			c.sendAsyncApiCommand(mpc.getCommand(), mpc.getCommandArgs());
		}
	}

	public void tranfer(TransferUserToMeetingCommand tutmc) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
			c.sendAsyncApiCommand(tutmc.getCommand(), tutmc.getCommandArgs());
		}
	}

	public void eject(EjectUserCommand mpc) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
			c.sendAsyncApiCommand(mpc.getCommand(), mpc.getCommandArgs());
		}
	}

	public void ejectAll(EjectAllUsersCommand mpc) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
			c.sendAsyncApiCommand(mpc.getCommand(), mpc.getCommandArgs());
		}
	}

	public void record(RecordConferenceCommand rcc) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
			EslMessage response = c.sendSyncApiCommand(rcc.getCommand(),
					rcc.getCommandArgs());
			rcc.handleResponse(response, conferenceEventListener);
		}
	}

	public void broadcastRTMP(ScreenshareBroadcastRTMPCommand rtmp) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
			EslMessage response = c.sendSyncApiCommand(rtmp.getCommand(), rtmp.getCommandArgs());
			rtmp.handleResponse(response, conferenceEventListener);
		}
	}

	public void hangUp(ScreenshareHangUpCommand huCmd) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
			EslMessage response = c.sendSyncApiCommand(huCmd.getCommand(), huCmd.getCommandArgs());
			huCmd.handleResponse(response, conferenceEventListener);
		}
	}
}
