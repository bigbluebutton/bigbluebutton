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
 * The MonitorAction starts monitoring (recording) a channel.<p>
 * It is implemented in <code>res/res_monitor.c</code>
 * 
 * @author srt
 * @version $Id: MonitorAction.java 938 2007-12-31 03:23:38Z srt $
 */
public class MonitorAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = 6840975934278794758L;
    private String channel;
    private String file;
    private String format;
    private Boolean mix;

    /**
     * Creates a new empty MonitorAction.
     */
    public MonitorAction()
    {
        super();
    }

    /**
     * Creates a new MonitorAction that starts monitoring the given channel and
     * writes voice data to the given files.<p>
     * The format of the files is "wav", they are not mixed.
     * 
     * @param channel the name of the channel to monitor
     * @param file the (base) name of the files to which the voice data is
     *            written
     * @since 0.2
     */
    public MonitorAction(String channel, String file)
    {
        super();
        this.channel = channel;
        this.file = file;
    }

    /**
     * Creates a new MonitorAction that starts monitoring the given channel and
     * writes voice data to the given files.<p>
     * The files are not mixed.
     * 
     * @param channel the name of the channel to monitor
     * @param file the (base) name of the files to which the voice data is
     *            written
     * @param format the format to use for encoding the voice files
     * @since 0.2
     */
    public MonitorAction(String channel, String file, String format)
    {
        super();
        this.channel = channel;
        this.file = file;
        this.format = format;
    }

    /**
     * Creates a new MonitorAction that starts monitoring the given channel and
     * writes voice data to the given file(s).
     * 
     * @param channel the name of the channel to monitor
     * @param file the (base) name of the file(s) to which the voice data is
     *            written
     * @param format the format to use for encoding the voice files
     * @param mix true if the two voice files should be joined at the end of the
     *            call
     * @since 0.2
     */
    public MonitorAction(String channel, String file, String format, Boolean mix)
    {
        super();
        this.channel = channel;
        this.file = file;
        this.format = format;
        this.mix = mix;
    }

    /**
     * Returns the name of this action, i.e. "Monitor".
     */
    @Override
   public String getAction()
    {
        return "Monitor";
    }

    /**
     * Returns the name of the channel to monitor.
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the name of the channel to monitor.<p>
     * This property is mandatory.
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the name of the file to which the voice data is written.
     */
    public String getFile()
    {
        return file;
    }

    /**
     * Sets the (base) name of the file(s) to which the voice data is written.<p>
     * If this property is not set it defaults to to the channel name as per CLI
     * with the '/' replaced by '-'.
     */
    public void setFile(String file)
    {
        this.file = file;
    }

    /**
     * Returns the format to use for encoding the voice files.
     */
    public String getFormat()
    {
        return format;
    }

    /**
     * Sets the format to use for encoding the voice files.<p>
     * If this property is not set it defaults to "wav".
     */
    public void setFormat(String format)
    {
        this.format = format;
    }

    /**
     * Returns true if the two voice files should be joined at the end of the
     * call.
     */
    public Boolean getMix()
    {
        return mix;
    }

    /**
     * Set to true if the two voice files should be joined at the end of the
     * call.
     */
    public void setMix(Boolean mix)
    {
        this.mix = mix;
    }
}
