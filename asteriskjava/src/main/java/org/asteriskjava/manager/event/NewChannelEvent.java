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
 * A NewChannelEvent is triggered when a new channel is created.<p>
 * It is implemented in <code>channel.c</code>
 *
 * @author srt
 * @version $Id: NewChannelEvent.java 1295 2009-04-28 10:07:23Z srt $
 */
public class NewChannelEvent extends AbstractChannelStateEvent
{
    /**
     * Serializable version identifier.
     */
    static final long serialVersionUID = 1L;

    private String accountCode;
    private String context;
    private String exten;

    public NewChannelEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the account code of the new channel.<p>
     * This property is available since Asterisk 1.6.
     *
     * @return the account code of the new channel.
     * @since 1.0.0
     */
    public String getAccountCode()
    {
        return accountCode;
    }

    /**
     * Sets the account code of the new channel.
     *
     * @param accountCode the account code of the new channel.
     * @since 1.0.0
     */
    public void setAccountCode(String accountCode)
    {
        this.accountCode = accountCode;
    }

    /**
     * Returns the context of the dialplan entry the channel started at.<p>
     * This property is available since Asterisk 1.6.
     *
     * @return the context of the dialplan entry the channel started at.
     * @since 1.0.0
     */
    public String getContext()
    {
        return context;
    }

    /**
     * Sets the context of the dialplan entry the channel started at.
     *
     * @param context the context of the dialplan entry the channel started at.
     * @since 1.0.0
     */
    public void setContext(String context)
    {
        this.context = context;
    }

    /**
     * Returns the extension of the dialplan entry the channel started at.<p>
     * This property is available since Asterisk 1.6.
     *
     * @return the extension of the dialplan entry the channel started at.
     * @since 1.0.0
     */
    public String getExten()
    {
        return exten;
    }

    /**
     * Sets the extension of the dialplan entry the channel started at.
     *
     * @param exten the extension of the dialplan entry the channel started at.
     * @since 1.0.0
     */
    public void setExten(String exten)
    {
        this.exten = exten;
    }
}
