/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.bbb;

import java.io.Serializable;
/**
 *
 * @author Markos
 */
public class Event implements IEvent,Serializable {

    private String conferenceID;
    private long tsevent;
    private String message;

    public Event() {
        super();
    }

    public String getConferenceID() {
        return this.conferenceID;
    }

    public String getMessage() {
        return this.message;
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

    public long getTimeStamp() {
        return this.tsevent;
    }

    public void setTimeStamp(long tsevent) {
        this.tsevent=tsevent;
    }

}

