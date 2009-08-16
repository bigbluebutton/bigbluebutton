/*
 *  Copyright 2004-2006 Stefan Reuter
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.asteriskjava.extras.appkonference.manager.event;

import org.asteriskjava.manager.event.ManagerEvent;

/**
 * Abstract base class providing common properties for Appkonference
 * (Asterisk's conference system) events.<p>
 * Appkonference events are implemented in <code>apps/app_meetme.c</code>
 * 
 */
public abstract class AbstractConferenceEvent extends ManagerEvent
{
    private String channel;
    private String conferenceName;

	protected AbstractConferenceEvent(Object source)
    {
        super(source);
    }
	
    public String getConferenceName() {
		return conferenceName;
	}

	public void setConferenceName(String conferenceName) {
		this.conferenceName = conferenceName;
	}



    public String getChannel()
    {
        return channel;
    }

    public void setChannel(String channel)
    {
        this.channel = channel;
    }

}
