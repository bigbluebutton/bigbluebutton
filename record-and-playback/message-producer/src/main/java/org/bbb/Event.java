/*
 * BigBlueButton - http://www.bigbluebutton.org
 *
 *
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 *
 * BigBlueButton is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3 of the License, or (at your option) any later
 * version.
 *
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 */

package org.bbb;

import java.io.Serializable;
/**
 *
 * @author Marco Calderon <mcmarkos86@gmail.com>
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
