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

import org.asteriskjava.manager.event.ZapShowChannelsCompleteEvent;
import org.asteriskjava.manager.event.ResponseEvent;

/**
 * The ZapShowChannelsAction requests the state of all zap channels.<p>
 * For each zap channel a ZapShowChannelsEvent is generated. After all zap
 * channels have been listed a ZapShowChannelsCompleteEvent is generated.
 * 
 * @see org.asteriskjava.manager.event.ZapShowChannelsEvent
 * @see org.asteriskjava.manager.event.ZapShowChannelsCompleteEvent
 * @author srt
 * @version $Id: ZapShowChannelsAction.java 1121 2008-08-16 20:54:12Z srt $
 */
public class ZapShowChannelsAction extends AbstractManagerAction
        implements
            EventGeneratingAction
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = 8697000330085766825L;

    /**
     * Creates a new ZapShowChannelsAction.
     */
    public ZapShowChannelsAction()
    {

    }

    /**
     * Returns the name of this action, i.e. "ZapShowChannels".
     */
    @Override
   public String getAction()
    {
        return "ZapShowChannels";
    }

    public Class<? extends ResponseEvent> getActionCompleteEventClass()
    {
        return ZapShowChannelsCompleteEvent.class;
    }
}
