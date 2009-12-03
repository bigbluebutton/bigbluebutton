package org.bigbluebutton.webconference.voice.asterisk.konference;

import org.asteriskjava.manager.ManagerConnection;
import org.asteriskjava.manager.ManagerEventListener;
import org.asteriskjava.manager.TimeoutException;
import org.asteriskjava.manager.action.CommandAction;
import org.asteriskjava.manager.event.ManagerEvent;
import org.asteriskjava.manager.response.CommandResponse;
import org.asteriskjava.manager.response.ManagerError;
import org.asteriskjava.manager.response.ManagerResponse;
import org.bigbluebutton.webconference.voice.asterisk.konference.actions.KonferenceCommand;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.KonferenceEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceJoinEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceLeaveEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceMemberMuteEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceMemberUnmuteEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceStateEvent;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

import java.io.IOException;

class KonferenceManager implements ManagerEventListener {
	private static Logger log = Red5LoggerFactory.getLogger( KonferenceManager.class, "bigbluebutton" );

    private final ManagerConnection manager;
    private KonferenceEventHandler eventHandler;
    
    KonferenceManager(ManagerConnection manager) {
        this.manager = manager;
               
        manager.registerUserEventClass(ConferenceJoinEvent.class);
        manager.registerUserEventClass(ConferenceLeaveEvent.class);
        manager.registerUserEventClass(ConferenceStateEvent.class);
        manager.registerUserEventClass(ConferenceMemberMuteEvent.class);
        manager.registerUserEventClass(ConferenceMemberUnmuteEvent.class);
    }

    private void handleConferenceEvent(KonferenceEvent event) {
    	eventHandler.handleKonferenceEvent(event);
    }
    
    public void sendCommand(KonferenceCommand command) {
    	final ManagerResponse response;
    	CommandAction cmd = command.getCommandAction(); 
        try {
            response = manager.sendAction(cmd);
                        
            if (response instanceof ManagerError) {
                log.error("Unable to send command: ");
                return;
            }
            
            if (!(response instanceof CommandResponse)) {
                log.error("Response to command is not a CommandResponse but "
                        + response.getClass());
                return;
            }
            
            command.handleResponse(response, eventHandler);
        } catch (TimeoutException e) {
    		System.out.println("Unable to send command");
    	} catch (IllegalArgumentException e) {
    		log.error("Unable to send command: ");
		} catch (IllegalStateException e) {
			log.error("Unable to send command: ");
		} catch (IOException e) {
			log.error("Unable to send command: ");
		}    	    	
    }

	public void onManagerEvent(ManagerEvent event) {
		handleConferenceEvent((KonferenceEvent)event);		
	}

	public void setEventHandler(KonferenceEventHandler eventHandler) {
		this.eventHandler = eventHandler;
	}
}
