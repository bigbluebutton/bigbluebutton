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
package org.asteriskjava.manager.action;

import org.asteriskjava.manager.event.ResponseEvent;
import org.asteriskjava.manager.event.ShowDialplanCompleteEvent;

/**
 * Retrieves a list of all priorities defined in the dialplan.<p>
 * For each priority a ListDialplanEvent is sent by Asterisk containing
 * the details. When all priorities have been reported a ShowDialplanCompleteEvent is
 * sent.<p>
 * Available since Asterisk 1.6
 *
 * @author srt
 * @version $Id: ShowDialplanAction.java 1121 2008-08-16 20:54:12Z srt $
 * @see org.asteriskjava.manager.event.ListDialplanEvent
 * @see org.asteriskjava.manager.event.ShowDialplanCompleteEvent
 * @since 1.0.0
 */
public class ShowDialplanAction extends AbstractManagerAction implements EventGeneratingAction
{
    private static final long serialVersionUID = 1L;

    /**
     * Creates a new ShowDialplanAction.
     */
    public ShowDialplanAction()
    {

    }

    @Override
    public String getAction()
    {
        return "ShowDialplan";
    }

    public Class<? extends ResponseEvent> getActionCompleteEventClass()
    {
        return ShowDialplanCompleteEvent.class;
    }
}