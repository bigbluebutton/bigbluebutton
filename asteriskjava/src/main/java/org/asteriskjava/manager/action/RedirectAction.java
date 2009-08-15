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
 * Redirects a given channel (and an optional additional channel) to a new
 * extension.<p>
 * The additional channel is usually used when redirecting two bridged channel
 * for example to a MeetMe room.<p>
 * Note that BRIstuffed versions of Asterisk behave slightly different:
 * While the standard version only allows redirecting the two channels to the same
 * context, extension, priority the BRIstuffed version uses context, extension, 
 * priority only for the first channel and extraContext, extraExtension, 
 * extraPriority for the second channel. The standard version ignores the 
 * extraContext, extraExtension, extraPriority properties.  
 * 
 * @author srt
 * @version $Id: RedirectAction.java 938 2007-12-31 03:23:38Z srt $
 */
public class RedirectAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier
     */
    static final long serialVersionUID = 1869279324159418150L;

    private String channel;
    private String extraChannel;
    private String exten;
    private String context;
    private Integer priority;
    private String extraExten;
    private String extraContext;
    private Integer extraPriority;

    /**
     * Creates a new empty RedirectAction.
     */
    public RedirectAction()
    {

    }

    /**
     * Creates a new RedirectAction that redirects the given channel to the
     * given context, extension, priority triple.
     * 
     * @param channel the name of the channel to redirect
     * @param context the destination context
     * @param exten the destination extension
     * @param priority the destination priority
     * @since 0.2
     */
    public RedirectAction(String channel, String context, String exten,
            Integer priority)
    {
        this.channel = channel;
        this.context = context;
        this.exten = exten;
        this.priority = priority;
    }

    /**
     * Creates a new RedirectAction that redirects the given channels to the
     * given context, extension, priority triple.<p>
     * This constructor only works standard versions of Asterisk, i.e. non-BRIstuffed
     * versions.
     * When used with a BRIstuffed version (and not setting extraContext, extraExten and
     * extraPriority) the second channel is just hung up.  
     * 
     * @param channel the name of the first channel to redirect
     * @param extraChannel the name of the second channel to redirect
     * @param context the destination context
     * @param exten the destination extension
     * @param priority the destination priority
     * @since 0.2
     */
    public RedirectAction(String channel, String extraChannel, String context,
            String exten, Integer priority)
    {
        this.channel = channel;
        this.extraChannel = extraChannel;
        this.context = context;
        this.exten = exten;
        this.priority = priority;
    }

    /**
     * Creates a new RedirectAction that redirects the given channels to the
     * given context, extension, priority triples.<p>
     * This constructor works for BRIstuffed versions of Asterisk, if used
     * with a standard version the extraContext, extraExten and
     * extraPriroity attributes are ignored.
     * 
     * @param channel the name of the first channel to redirect
     * @param extraChannel the name of the second channel to redirect
     * @param context the destination context for the first channel
     * @param exten the destination extension for the first channel
     * @param priority the destination priority for the first channel
     * @param extraContext the destination context for the second channel
     * @param extraExten the destination extension for the second channel
     * @param extraPriority the destination priority for the second channel
     * @since 0.3
     */
    public RedirectAction(String channel, String extraChannel, String context,
            String exten, Integer priority, String extraContext,
            String extraExten, Integer extraPriority)
    {
        this.channel = channel;
        this.extraChannel = extraChannel;
        this.context = context;
        this.exten = exten;
        this.priority = priority;
        this.extraContext = extraContext;
        this.extraExten = extraExten;
        this.extraPriority = extraPriority;
    }

    /**
     * Returns the name of this action, i.e. "Redirect".
     */
    @Override
   public String getAction()
    {
        return "Redirect";
    }

    /**
     * Returns name of the channel to redirect.
     * 
     * @return the name of the channel to redirect
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the name of the channel to redirect.
     * 
     * @param channel the name of the channel to redirect
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the name of the additional channel to redirect.
     * 
     * @return the name of the additional channel to redirect
     */
    public String getExtraChannel()
    {
        return extraChannel;
    }

    /**
     * Sets the name of the additional channel to redirect.
     * 
     * @param extraChannel the name of the additional channel to redirect
     */
    public void setExtraChannel(String extraChannel)
    {
        this.extraChannel = extraChannel;
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

    /**
     * Returns the destination context for the additional channel.<p>
     * This property is only used by BRIstuffed Asterisk servers.
     * 
     * @return the destination context for the additional channel.
     */
    public String getExtraContext()
    {
        return extraContext;
    }

    /**
     * Sets the destination context for the additional channel.<p>
     * This property is only used by BRIstuffed Asterisk servers.
     * 
     * @param extraContext the destination context for the additional channel.
     */
    public void setExtraContext(String extraContext)
    {
        this.extraContext = extraContext;
    }

    /**
     * Sets the destination extension for the additional channel.<p>
     * This property is only used by BRIstuffed Asterisk servers.
     * 
     * @return the destination extension for the additional channel.
     */
    public String getExtraExten()
    {
        return extraExten;
    }

    /**
     * Sets the destination extension for the additional channel.<p>
     * This property is only used by BRIstuffed Asterisk servers.
     * 
     * @param extraExten the destination extension for the additional channel.
     */
    public void setExtraExten(String extraExten)
    {
        this.extraExten = extraExten;
    }

    /**
     * Returns the destination priority for the additional channel.<p>
     * This property is only used by BRIstuffed Asterisk servers.
     * 
     * @return the destination priority for the additional channel.
     */
    public Integer getExtraPriority()
    {
        return extraPriority;
    }

    /**
     * Sets the destination priority for the additional channel.<p>
     * This property is only used by BRIstuffed Asterisk servers.
     * 
     * @param extraPriority the destination priority for the additional channel.
     */
    public void setExtraPriority(Integer extraPriority)
    {
        this.extraPriority = extraPriority;
    }
}
