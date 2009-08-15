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
package org.asteriskjava.manager.event;

/**
 * A RegistrationsCompleteEvent is triggered after the details of all SIP
 * registrations has been reported in response to an SipShowRegistryAction.<p>
 * Available since Asterisk 1.6
 *
 * @author Laureano
 * @version $Id: RegistrationsCompleteEvent.java 1166 2008-09-18 02:41:44Z sprior $
 * @see RegistryEntryEvent
 * @see org.asteriskjava.manager.action.SipShowRegistryAction
 * @since 1.0.0
 */
public class RegistrationsCompleteEvent extends ResponseEvent
{

    /**
    * 
    */
   private static final long serialVersionUID = 6269829662009989518L;
   private Integer listItems;
    private String eventList;

    /**
     * Creates a new RegistrationsCompleteEvent.
     */
    public RegistrationsCompleteEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the number of SIP registrations that have been reported.
     *
     * @return the number of SIP registrations that have been reported.
     */
    public Integer getListItems()
    {
        return listItems;
    }

    /**
     * Sets the number of SIP registrations that have been reported.
     *
     * @param listItems the number of SIP registrations that have been reported.
     */
    public void setListItems(Integer listItems)
    {
        this.listItems = listItems;
    }

    /**
     * Returns always "Complete".
     *
     * @return always returns "Complete" confirming that all RegistryEntry events have been sent.
     */
    public String getEventList()
    {
        return eventList;
    }


    public void setEventList(String eventList)
    {
        this.eventList = eventList;
    }

}
