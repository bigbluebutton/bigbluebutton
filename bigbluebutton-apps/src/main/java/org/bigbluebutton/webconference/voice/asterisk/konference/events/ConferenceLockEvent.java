package org.bigbluebutton.webconference.voice.asterisk.konference.events;

public class ConferenceLockEvent extends KonferenceEvent {
	/*
	 * WARNING: Be careful not to rename the class as Asterisk-Java uses the class name
	 * to convert from raw AMI to Java. Therefore, when the appkonference event name
	 * changes, you should also rename this class.
	 */
	public ConferenceLockEvent(Object source) {
        super(source);
    }
}
