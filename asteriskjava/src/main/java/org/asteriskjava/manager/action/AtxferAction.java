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

/**
 * Starts an attended transfer. This action seems to be a bit of a hack. See
 * <a href="http://bugs.digium.com/view.php?id=12158">http://bugs.digium.com/view.php?id=12158</a>
 * for details.<p>
 * Available since Asterisk 1.6
 *
 * @author srt
 * @version $Id: AtxferAction.java 1122 2008-08-16 22:34:37Z srt $
 * @since 1.0.0
 */
public class AtxferAction extends AbstractManagerAction
{
    static final long serialVersionUID = 1L;

    private String channel;
    private String exten;
    private String context;
    private Integer priority;

    /**
     * Creates a new empty AtxferAction.
     */
    public AtxferAction()
    {

    }

    /**
     * Creates a new AtxferAction that initiates an attended transfer of the given channel to the
     * given context, extension, priority triple.
     *
     * @param channel  the name of the channel to transfer
     * @param context  the destination context
     * @param exten    the destination extension
     * @param priority the destination priority
     */
    public AtxferAction(String channel, String context, String exten, Integer priority)
    {
        this.channel = channel;
        this.context = context;
        this.exten = exten;
        this.priority = priority;
    }


    /**
     * Returns the name of this action, i.e. "Atxfer".
     */
    @Override
    public String getAction()
    {
        return "Atxfer";
    }

    /**
     * Returns name of the channel to transfer.
     *
     * @return the name of the channel to transfer
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets name of the channel to transfer.
     *
     * @param channel the name of the channel to transfer
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the destination context.
     *
     * @return the destination context
     */
    public String getContext()
    {
        return context;
    }

    /**
     * Sets the destination context.
     *
     * @param context the destination context
     */
    public void setContext(String context)
    {
        this.context = context;
    }

    /**
     * Returns the destination extension.
     *
     * @return the destination extension
     */
    public String getExten()
    {
        return exten;
    }

    /**
     * Sets the destination extension.
     *
     * @param exten the destination extension
     */
    public void setExten(String exten)
    {
        this.exten = exten;
    }

    /**
     * Returns the destination priority.
     *
     * @return the destination priority
     */
    public Integer getPriority()
    {
        return priority;
    }

    /**
     * Sets the destination priority.
     *
     * @param priority the destination priority
     */
    public void setPriority(Integer priority)
    {
        this.priority = priority;
    }
}