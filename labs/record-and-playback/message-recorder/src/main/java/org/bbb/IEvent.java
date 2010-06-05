/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.bbb;

/**
 *
 * @author Markos
 */
public interface IEvent extends java.io.Serializable {
    public String getConferenceID(); //conferenceid
    public void setConferenceID(String conferenceid); //conferenceid
    public String getUUID(); // UUID for each message
    public void setUUID(String uuid); // UUID for each message
    public String getMessage(); //JSON message
    public void setMessage(String message); //JSON message
}
