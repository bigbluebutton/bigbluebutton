package org.bigbluebutton.recorder;

public interface IEventMessage extends java.io.Serializable {
	 public String getConferenceID(); //conferenceid
	 public long getTimeStamp(); // Timestamp for each message
	 public String getMessage(); //JSON message
}
