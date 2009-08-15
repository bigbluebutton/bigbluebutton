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
 * A RenameEvent is triggered when the name of a channel is changed.
 * <p>
 * It is implemented in <code>channel.c</code>
 * 
 * @author srt
 * @version $Id: RenameEvent.java 973 2008-02-03 16:21:12Z srt $
 */
public class RenameEvent extends ManagerEvent
{
    /**
     * Serializable version identifier.
     */
    static final long serialVersionUID = 3400165738000349767L;

    /**
     * Old name of the channel before renaming occured.
     */
    protected String channel;

    /**
     * New name of the channel after renaming occured.
     */
    protected String newname;

    /**
     * New unique id.
     */
    protected String newUniqueId;

    /**
     * Unique id of the channel.
     */
    protected String uniqueId;

    public RenameEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the new name of the channel.
     * 
     * @return the new name of the channel.
     */
    public final String getNewname()
    {
        return newname;
    }

    /**
     * Sets the new name of the channel.
     * 
     * @param newname the new name of the channel.
     */
    public final void setNewname(final String newname)
    {
        this.newname = newname;
    }

    /**
     * Returns the old name of the channel.
     *
     * @return the old name of the channel.
     * @since 1.0.0
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the old name of the channel.<p>
     * The "Oldchannel" property has been renamed to "Channel" as of Asterisk 1.6.
     *
     * @param channel the old name of the channel.
     * @since 1.0.0
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the old name of the channel.
     * 
     * @return the old name of the channel.
     * @deprecated use {@link @getChannel} instead.
     */
    public final String getOldname()
    {
        return channel;
    }

    /**
     * Sets the old name of the channel.<p>
     * The "Oldchannel" property is used by Asterisk up to 1.4 and has been renamed to "Channel"
     * as of Asterisk 1.6.
     * 
     * @param oldname the old name of the channel.
     */
    public final void setOldname(final String oldname)
    {
        this.channel = oldname;
    }

    /**
     * Returns the unique id of the channel.
     * 
     * @return the unique id of the channel.
     */
    public final String getUniqueId()
    {
        return uniqueId;
    }

    /**
     * Sets the unique id of the channel.
     * 
     * @param uniqueId the unique id of the channel.
     */
    public final void setUniqueId(final String uniqueId)
    {
        this.uniqueId = uniqueId;
    }

    /**
     * Returns the new unique id of the channel.
     * <p>
     * This property is only available on BRIstuffed Asterisk servers.
     * <p>
     * The purpose of this property is unclear as the unique id is supposed to
     * never change.
     * 
     * @return the new unique id of the channel.
     * @since 0.3
     */
    public final String getNewUniqueId()
    {
        return newUniqueId;
    }

    /**
     * Sets the new unique id of the channel.
     * <p>
     * This property is only available on BRIstuffed Asterisk servers.
     * <p>
     * The purpose of this property is unclear as the unique id is supposed to
     * never change.
     * 
     * @param newUniqueId the new unique id of the channel.
     * @since 0.3
     */
    public final void setNewUniqueId(final String newUniqueId)
    {
        this.newUniqueId = newUniqueId;
    }
}
