/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebuttonproject.asterisk;

import java.beans.PropertyChangeListener;
import java.util.Date;


/**
 * The Interface IParticipant.
 */
public interface IParticipant {
    
    /**
     * Checks if is talking.
     * 
     * @return true, if is talking
     */
    boolean isTalking();

    /**
     * Checks if is muted.
     * 
     * @return true, if is muted
     */
    boolean isMuted();
    
    /**
     * Gets the date joined.
     * 
     * @return the date joined
     */
    Date getDateJoined();

    /**
     * Gets the date left.
     * 
     * @return the date left
     */
    Date getDateLeft();
    
    /**
     * Gets the conference.
     * 
     * @return the conference
     */
    IConference getConference();

    /**
     * Gets the participant id.
     * 
     * @return the participant id
     */
    Integer getParticipantId();
    
    /**
     * Gets the caller id name.
     * 
     * @return the caller id name
     */
    String getCallerIdName();
    
    /**
     * Gets the caller id number.
     * 
     * @return the caller id number
     */
    String getCallerIdNumber();

    /**
     * Mute.
     */
    void mute();

    /**
     * Unmute.
     */
    void unmute();

    /**
     * Kick.
     */
    void kick();	
    
    /**
     * Adds the property change listener.
     * 
     * @param listener the listener
     */
    void addPropertyChangeListener(PropertyChangeListener listener);
    
}
