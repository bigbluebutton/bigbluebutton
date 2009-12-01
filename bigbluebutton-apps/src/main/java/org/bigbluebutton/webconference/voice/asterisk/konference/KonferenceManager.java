package org.bigbluebutton.webconference.voice.asterisk.konference;

import org.asteriskjava.manager.ManagerConnection;
import org.asteriskjava.manager.ManagerEventListener;
import org.asteriskjava.manager.TimeoutException;
import org.asteriskjava.manager.action.CommandAction;
import org.asteriskjava.manager.event.ManagerEvent;
import org.asteriskjava.manager.response.CommandResponse;
import org.asteriskjava.manager.response.ManagerError;
import org.asteriskjava.manager.response.ManagerResponse;
import org.asteriskjava.util.Log;
import org.asteriskjava.util.LogFactory;
import org.bigbluebutton.webconference.voice.asterisk.konference.actions.KonferenceCommand;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.KonferenceEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceJoinEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceLeaveEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceMemberMuteEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceMemberUnmuteEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceStateEvent;

import java.io.IOException;
import java.util.regex.Pattern;

class KonferenceManager implements ManagerEventListener {
    private static final String KONFERENCE_LIST_COMMAND = "konference list";
    private static final Pattern KONFERENCE_LIST_PATTERN = Pattern.compile("^User #: ([0-9]+).*Channel: (\\S+).*$");

    private final Log logger = LogFactory.getLog(getClass());
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
    	eventHandler.handlKonferenceEvent(event);
    }
    
    public void sendCommand(KonferenceCommand command) {
    	final ManagerResponse response;
    	CommandAction cmd = command.getCommandAction(); 
        try {
            response = manager.sendAction(cmd);
                        
            if (response instanceof ManagerError) {
                logger.error("Unable to send \"" + KONFERENCE_LIST_COMMAND + "\" command: " + response.getMessage());
                return;
            }
            
            if (!(response instanceof CommandResponse)) {
                logger.error("Response to \"" + KONFERENCE_LIST_COMMAND + "\" command is not a CommandResponse but "
                        + response.getClass());
                return;
            }
            
            command.handleResponse(response, eventHandler);
        } catch (TimeoutException e) {
    		System.out.println("Unable to send \"" + KONFERENCE_LIST_COMMAND + "\" command");
    	} catch (IllegalArgumentException e) {
    		logger.error("Unable to send \"" + KONFERENCE_LIST_COMMAND + "\" command: ");
		} catch (IllegalStateException e) {
			logger.error("Unable to send \"" + KONFERENCE_LIST_COMMAND + "\" command: ");
		} catch (IOException e) {
			logger.error("Unable to send \"" + KONFERENCE_LIST_COMMAND + "\" command: ");
		}    	    	
    }

	public void onManagerEvent(ManagerEvent event) {
		handleConferenceEvent((KonferenceEvent)event);		
	}

	public void setEventHandler(KonferenceEventHandler eventHandler) {
		this.eventHandler = eventHandler;
	}
}
