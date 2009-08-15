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
package org.asteriskjava.live;

import org.asteriskjava.util.AstState;

/**
 * The lifecycle status of an {@link org.asteriskjava.live.AsteriskChannel}.
 * <br>
 * Defined in <code>channel.c</code> function <code>ast_state2str</code>.
 * 
 * @author srt
 * @version $Id: ChannelState.java 1026 2008-04-06 09:35:12Z srt $
 */
public enum ChannelState
{
    /**
     * Channel is down and available.
     * This is the initial state of the channel when it is not yet in use.
     */
    DOWN(AstState.AST_STATE_DOWN),

    /**
     * Channel is down, but reserved.
     */
    RSRVD(AstState.AST_STATE_RSRVD),

    /**
     * Channel is off hook.
     */
    OFFHOOK(AstState.AST_STATE_OFFHOOK),

    /**
     * Digits (or equivalent) have been dialed.
     */
    DIALING(AstState.AST_STATE_DIALING),

    /**
     * Line is ringing.
     */
    RING(AstState.AST_STATE_RING),

    /**
     * Remote end is ringing.
     */
    RINGING(AstState.AST_STATE_RINGING),

    /**
     * Line is up.
     */
    UP(AstState.AST_STATE_UP),

    /**
     * Line is busy.
     */
    BUSY(AstState.AST_STATE_BUSY),

    /**
     * Digits (or equivalent) have been dialed while offhook.
     */
    DIALING_OFFHOOK(AstState.AST_STATE_DIALING_OFFHOOK),

    /**
     * Channel has detected an incoming call and is waiting for ring.
     */
    PRERING(AstState.AST_STATE_PRERING),

    /**
     * The channel has been hung up and is not longer available on the Asterisk server.
     */
    HUNGUP(-1);

    private int status;

    /**
     * Creates a new instance.
     *
     * @param status the numerical status code.
     */
    ChannelState(int status)
    {
        this.status = status;
    }

    /**
     * Returns the numerical status code.
     *
     * @return the numerical status code.
     */
    public int getStatus()
    {
        return status;
    }

    /**
     * Returns value specified by int. Use this to transform
     * {@link org.asteriskjava.manager.event.AbstractChannelStateEvent#getChannelState()}.
     *
     * @param status integer representation of the status.
     * @return corresponding ChannelState object or <code>null</code> if none matches.
     */
    public static ChannelState valueOf(Integer status)
    {
        if (status == null)
        {
            return null;
        }

        for (ChannelState tmp : ChannelState.values())
        {
            if (tmp.getStatus() == status)
            {
                return tmp;
            }
        }

        return null;
    }
}
