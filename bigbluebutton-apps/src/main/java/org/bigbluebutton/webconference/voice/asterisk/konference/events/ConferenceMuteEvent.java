package org.bigbluebutton.webconference.voice.asterisk.konference.events;

import org.asteriskjava.manager.event.ManagerEvent;

public class ConferenceMuteEvent extends ManagerEvent {
	/*
	 * WARNING: Be careful not to rename the class as Asterisk-Java uses the class name
	 * to convert from raw AMI to Java. Therefore, when the appkonference event name
	 * changes, you should also rename this class.
	 */
	private static final long serialVersionUID = 1L;

	private String conferenceName;
	
	public ConferenceMuteEvent(Object source) {
        super(source);
    }

	public String getConferenceName() {
		return conferenceName;
	}

	public void setConferenceName(String conferenceName) {
		this.conferenceName = conferenceName;
	}
}
