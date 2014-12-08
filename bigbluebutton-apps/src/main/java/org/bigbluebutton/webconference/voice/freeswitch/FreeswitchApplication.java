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
package org.bigbluebutton.webconference.voice.freeswitch;

import java.io.File;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import org.bigbluebutton.webconference.voice.ConferenceServiceProvider;
import org.bigbluebutton.webconference.voice.freeswitch.actions.BroadcastConferenceCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.EjectAllUsersCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.EjectParticipantCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.FreeswitchCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.PopulateRoomCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.MuteParticipantCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.RecordConferenceCommand;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class FreeswitchApplication implements ConferenceServiceProvider {
	private static Logger log = Red5LoggerFactory.getLogger( FreeswitchApplication.class, "bigbluebutton" );
	
	private static final int SENDERTHREADS = 1;
	private static final Executor msgSenderExec = Executors.newFixedThreadPool(SENDERTHREADS);
	private static final Executor runExec = Executors.newFixedThreadPool(SENDERTHREADS);
	private BlockingQueue<FreeswitchCommand> messages = new LinkedBlockingQueue<FreeswitchCommand>();
  private ConnectionManager manager;
    
  private String icecastProtocol = "shout";
  private String icecastHost = "localhost";
  private int icecastPort = 8000;
  private String icecastUsername = "source";
  private String icecastPassword = "hackme";
  private String icecastStreamExtension = ".mp3";
  private Boolean icecastBroadcast = false;
    
  private final String USER = "0"; /* not used for now */
  
  private volatile boolean sendMessages = false;
    
  private void queueMessage(FreeswitchCommand command) {
  	try {
			messages.offer(command, 5, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
  }
    
  @Override
  public void populateRoom(String room) {    
  	PopulateRoomCommand prc = new PopulateRoomCommand(room, USER);
   	queueMessage(prc);
  }

  public void mute(String room, String participant, Boolean mute) {
    MuteParticipantCommand mpc = new MuteParticipantCommand(room, participant, mute, USER);
    queueMessage(mpc);
  }

  public void eject(String room, String participant) {
    EjectParticipantCommand mpc = new EjectParticipantCommand(room, participant, USER);       
    queueMessage(mpc);
  }

  @Override
  public void ejectAll(String room) {
    EjectAllUsersCommand mpc = new EjectAllUsersCommand(room, USER);
    queueMessage(mpc);
  }
    
  private Long genTimestamp() {
  	return TimeUnit.NANOSECONDS.toMillis(System.nanoTime());
  }
    
  @Override
  public void record(String room, String meetingid){
  	String RECORD_DIR = "/var/freeswitch/meetings";        
   	String voicePath = RECORD_DIR + File.separatorChar + meetingid + "-" + genTimestamp() + ".wav";
    	
   	RecordConferenceCommand rcc = new RecordConferenceCommand(room, USER, true, voicePath);
   	queueMessage(rcc);
  }

  @Override
  public void broadcast(String room, String meetingid) {        
    if (icecastBroadcast) {
      	broadcastToIcecast(room, meetingid);
    }
  }
    
  private void broadcastToIcecast(String room, String meetingid) {
   	String shoutPath = icecastProtocol + "://" + icecastUsername + ":" + icecastPassword + "@" + icecastHost + ":" + icecastPort 
    			+ File.separatorChar + meetingid + "." + icecastStreamExtension;       
    	
    BroadcastConferenceCommand rcc = new BroadcastConferenceCommand(room, USER, true, shoutPath);
    queueMessage(rcc);
  }
    
  public void setConnectionManager(ConnectionManager manager) {
    this.manager = manager;
  }
    
  public void setIcecastProtocol(String protocol) {
  	icecastProtocol = protocol;
  }
    
  public void setIcecastHost(String host) {
  	icecastHost = host;
  }
    
  public void setIcecastPort(int port) {
  	icecastPort = port;
  }
    
  public void setIcecastUsername(String username) {
   	icecastUsername = username;
  }
    
  public void setIcecastPassword(String password) {
   	icecastPassword = password;
  }
    
  public void setIcecastBroadcast(Boolean broadcast) {
   	icecastBroadcast = broadcast;
  }

  public void setIcecastStreamExtension(String ext) {
  	icecastStreamExtension = ext;
  }

	private void sendMessageToFreeswitch(final FreeswitchCommand command) {
		Runnable task = new Runnable() {
			public void run() {
				if (command instanceof PopulateRoomCommand) {
					PopulateRoomCommand cmd = (PopulateRoomCommand) command;
					log.debug("Sending PopulateRoomCommand for conference = [" + cmd.getRoom() + "]");
					manager.getUsers(cmd);
				} else if (command instanceof MuteParticipantCommand) {
					MuteParticipantCommand cmd = (MuteParticipantCommand) command;
					log.debug("Sending MuteParticipantCommand for conference = [" + cmd.getRoom() + "]");
					System.out.println("Sending MuteParticipantCommand for conference = [" + cmd.getRoom() + "]");
					manager.mute(cmd);
				} else if (command instanceof EjectParticipantCommand) {
					EjectParticipantCommand cmd = (EjectParticipantCommand) command;
					log.debug("Sending EjectParticipantCommand for conference = [" + cmd.getRoom() + "]");
					manager.eject(cmd);
				} else if (command instanceof EjectAllUsersCommand) {
					EjectAllUsersCommand cmd = (EjectAllUsersCommand) command;
					log.debug("Sending EjectAllUsersCommand for conference = [" + cmd.getRoom() + "]");
					manager.ejectAll(cmd);
				} else if (command instanceof RecordConferenceCommand) {
					manager.record((RecordConferenceCommand) command);
				} else if (command instanceof BroadcastConferenceCommand) {
					manager.broadcast((BroadcastConferenceCommand) command);
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
					FreeswitchCommand message;
					try {
						message = messages.take();
						sendMessageToFreeswitch(message);	
					} catch (InterruptedException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
									
				}
			}
		};
		msgSenderExec.execute(sender);		
	}
	
	public void stop() {
		sendMessages = false;
	}

}