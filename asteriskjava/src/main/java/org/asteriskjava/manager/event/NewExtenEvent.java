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
 * A NewExtenEvent is triggered when a channel is connected to a new extension.<p>
 * It is implemented in <code>pbx.c</code>
 * 
 * @author srt
 * @version $Id: NewExtenEvent.java 938 2007-12-31 03:23:38Z srt $
 */
public class NewExtenEvent extends ManagerEvent
{
    /**
     * Serializable version identifier
     */
    static final long serialVersionUID = -467486409866099387L;

    private String uniqueId;
    private String context;
    private String extension;
    private String application;
    private String appData;
    private Integer priority;
    private String channel;

    /**
     * @param source
     */
    public NewExtenEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the unique id of the channel.
     */
    public String getUniqueId()
    {
        return uniqueId;
    }

    /**
     * Sets the unique id of the channel.
     */
    public void setUniqueId(String uniqueId)
    {
        this.uniqueId = uniqueId;
    }

    /**
     * Returns the name of the application that is executed.
     */
    public String getApplication()
    {
        return application;
    }

    /**
     * Sets the name of the application that is executed.
     */
    public void setApplication(String application)
    {
        this.application = application;
    }

    /**
     * Returns the parameters passed to the application that is executed. The parameters are
     * separated by a '|' character.
     */
    public String getAppData()
    {
        return appData;
    }

    /**
     * Sets the parameters passed to the application that is executed.
     */
    public void setAppData(String appData)
    {
        this.appData = appData;
    }

    /**
     * Returns the name of the channel.
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the name of the channel.
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the name of the context of the connected extension.
     */
    public String getContext()
    {
        return context;
    }

    /**
     * Sets the name of the context of the connected extension.
     */
    public void setContext(String context)
    {
        this.context = context;
    }

    /**
     * Returns the extension.
     */
    public String getExtension()
    {
        return extension;
    }

    /**
     * Sets the extension.
     */
    public void setExtension(String extension)
    {
        this.extension = extension;
    }

    /**
     * Returns the priority.
     */
    public Integer getPriority()
    {
        return priority;
    }

    /**
     * Sets the priority.
     */
    public void setPriority(Integer priority)
    {
        this.priority = priority;
    }
}
