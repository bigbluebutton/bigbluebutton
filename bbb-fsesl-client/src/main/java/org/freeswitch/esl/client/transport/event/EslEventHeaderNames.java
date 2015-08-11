/*
 * Copyright 2010 david varnes.
 *
 * Licensed under the Apache License, version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at:
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.freeswitch.esl.client.transport.event;

/**
 * Convenience container class for some commonly used ESL event header names (note there are many more!).
 * <p>
 * These names are stored as strings (rather than an Enum) so that there is no necessity to keep up to
 * date with changes or additions to event header names.
 * 
 * @author  david varnes
 */
public class EslEventHeaderNames
{
    /**
     * {@code "Event-Name"}
     */
    public static final String EVENT_NAME = "Event-Name";
    /**
     * {@code "Event-Subclass"}     *
     */
    public static final String EVENT_SUBCLASS = "Event-Subclass";
    /**
     * {@code "Event-Date-Local"}
     */
    public static final String EVENT_DATE_LOCAL = "Event-Date-Local";
    /**
     * {@code "Event-Date-GMT"}
     */
    public static final String EVENT_DATE_GMT = "Event-Date-GMT";
    /**
     * {@code "Event-Date-Timestamp"}
     */
    public static final String EVENT_DATE_TIMESTAMP = "Event-Date-Timestamp";
    /**
     * {@code "Event-Calling-File"}
     */
    public static final String EVENT_CALLING_FILE = "Event-Calling-File";
    /**
     * {@code "Event-Calling-Function"}
     */
    public static final String EVENT_CALLING_FUNCTION = "Event-Calling-Function";
    /**
     * {@code "Event-Calling-Line-Number"}
     */
    public static final String EVENT_CALLING_LINE_NUMBER = "Event-Calling-Line-Number";
    /**
     * {@code "FreeSWITCH-Hostname"}
     */
    public static final String FREESWITCH_HOSTNAME = "FreeSWITCH-Hostname";
    /**
     * {@code "FreeSWITCH-IPv4"}
     */
    public static final String FREESWITCH_IPV4 = "FreeSWITCH-IPv4";
    /**
     * {@code "FreeSWITCH-IPv6"}
     */
    public static final String FREESWITCH_IPV6 = "FreeSWITCH-IPv6";
    /**
     * {@code "Core-UUID"}
     */
    public static final String CORE_UUID = "Core-UUID";
    /**
     * {@code "Content-Length"}
     */
    public static final String CONTENT_LENGTH = "Content-Length";
    /**
     * {@code "Job-Command"}
     */
    public static final String JOB_COMMAND = "Job-Command";
    /**
     * {@code "Job-UUID"}
     */
    public static final String JOB_UUID = "Job-UUID";

    private EslEventHeaderNames()
    {
        /* private class */
    }
}
