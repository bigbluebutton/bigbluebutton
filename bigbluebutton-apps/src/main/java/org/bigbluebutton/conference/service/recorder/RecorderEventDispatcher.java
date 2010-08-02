package org.bigbluebutton.conference.service.recorder;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.Session;

import org.bigbluebutton.recorder.EventMessage;
import org.bigbluebutton.recorder.IEventMessage;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.jms.core.MessageCreator;

public class RecorderEventDispatcher implements IRecorder {

	private static Logger log = Red5LoggerFactory.getLogger( RecorderEventDispatcher.class, "bigbluebutton" );
	
	private final String conference;
	private final String room;
	
	private JmsTemplate jmsTemplate;
	
	public RecorderEventDispatcher(String conference, String room) {
		this.conference = conference;
		this.room = room;
	}
	
	public void sendEvents(final IEventMessage event) {
		jmsTemplate.send(new MessageCreator() {
            public Message createMessage(Session sn) throws JMSException {
                Message msg=sn.createObjectMessage(event);
                return msg;
            }
        });
	}
	
	@Override
	public void recordEvent(String message) {
		EventMessage event=new EventMessage();
		event.setConferenceID(room);
		event.setMessage(message);
		event.setTimeStamp(System.currentTimeMillis());
		sendEvents(event);
	}
	
	public void setJmsTemplate(JmsTemplate jmsTemplate){
		this.jmsTemplate=jmsTemplate;
	}

}
