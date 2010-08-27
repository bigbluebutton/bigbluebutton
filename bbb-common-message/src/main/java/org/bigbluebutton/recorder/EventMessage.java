package org.bigbluebutton.recorder;

public class EventMessage implements IEventMessage, java.io.Serializable {

	private String conferenceID;
    private long timestamp;
    private String message;
	
    public EventMessage() {
        super();
    }
    
    /**
     * @param conferenceID the conferenceID to set
     */
    public void setConferenceID(String conferenceID) {
        this.conferenceID = conferenceID;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public void setTimeStamp(long timestamp) {
        this.timestamp=timestamp;
    }
    
	@Override
	public String getConferenceID() {
		return this.conferenceID;
	}

	@Override
	public String getMessage() {
		return this.message;
	}

	@Override
	public long getTimeStamp() {
		return this.timestamp;
	}

}
