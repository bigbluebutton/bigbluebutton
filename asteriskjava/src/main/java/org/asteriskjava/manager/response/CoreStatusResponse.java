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
package org.asteriskjava.manager.response;

import java.util.Date;
import java.util.TimeZone;

import org.asteriskjava.util.DateUtil;

/**
 * Corresponds to a CoreStatusAction and contains the current status summary of the
 * Asterisk server.
 *
 * @author srt
 * @version $Id: CoreStatusResponse.java 1314 2009-05-28 12:24:54Z srt $
 * @see org.asteriskjava.manager.action.CoreStatusAction
 * @since 1.0.0
 */
public class CoreStatusResponse extends ManagerResponse
{
    private static final long serialVersionUID = 1L;

    private String coreStartupTime;
    private String coreReloadTime;
    private Integer coreCurrentCalls;
    private String coreStartupDate;
    private String coreReloadDate;


    /**
     * Returns the time the server (core module) was last reloaded. The format is %H:%M:%S.
     *
     * @return the time the server (core module) was last reloaded.
     */
    public String getCoreReloadTime()
    {
        return coreReloadTime;
    }

    public void setCoreReloadTime(String s)
    {
        // format is %H:%M:%S
        this.coreReloadTime = s;
    }

    /**
     * Returns the date the server (core module) was last reloaded. The format is Y-%m-%d.<p>
     * Available since Asterisk 1.6.3
     *
     * @return the date the server (core module) was last reloaded.
     */
    public String getCoreReloadDate()
    {
        return coreReloadDate;
    }

    public void setCoreReloadDate(String CoreReloadDate)
    {
        this.coreReloadDate = CoreReloadDate;
    }

    /**
     * Returns the and time the server (core module) was last reloaded.<p>
     * If either the date or time property is <code>null</code> (e.g. on Asterisk prior to 1.6.3) this method
     * returns <code>null</code>.
     *
     * @return the and time the server (core module) was last reloaded or <code>null</code> if not available.
     * @see #getCoreReloadDate()
     * @see #getCoreReloadTime()
     * @see #getCoreReloadDateTimeAsDate(java.util.TimeZone)
     */
    public Date getCoreReloadDateTimeAsDate()
    {
        return getCoreReloadDateTimeAsDate(null);
    }

    /**
     * Returns the date the server (core module) was last reloaded.<p>
     * If either the date or time property is <code>null</code> (e.g. on Asterisk prior to 1.6.3) this method
     * returns <code>null</code>.
     *
     * @param tz the time zone of the Asterisk server, <code>null</code> to use the default time zone.
     * @return the date the server (core module) was last reloaded or <code>null</code> if not available.
     * @see #getCoreReloadDate()
     * @see #getCoreReloadTime()
     */
    public Date getCoreReloadDateTimeAsDate(TimeZone tz)
    {
        if (coreReloadDate == null || coreReloadTime == null)
        {
            return null;
        }

        return DateUtil.parseDateTime(coreReloadDate + " " + coreReloadTime, tz);
    }

    /**
     * Returns the date the server was started. The format is Y-%m-%d.<p>
     * Available since Asterisk 1.6.3
     *
     * @return the date the server was started.
     */
    public String getCoreStartupDate()
    {
        return coreStartupDate;
    }

    public void setCoreStartupDate(String CoreStartupDate)
    {
        this.coreStartupDate = CoreStartupDate;
    }

    /**
     * Returns the time the server was started. The format is %H:%M:%S.
     *
     * @return the time the server was started.
     */
    public String getCoreStartupTime()
    {
        return coreStartupTime;
    }

    public void setCoreStartupTime(String s)
    {
        // format is %H:%M:%S
        this.coreStartupTime = s;
    }

    /**
     * Returns the date and time the server was started.<p>
     * If either the date or time property is <code>null</code> (e.g. on Asterisk prior to 1.6.3) this method
     * returns <code>null</code>.
     *
     * @return the date the server was started or <code>null</code> if not available.
     * @see #getCoreStartupDate()
     * @see #getCoreStartupTime()
     * @see #getCoreStartupDateTimeAsDate(java.util.TimeZone)
     */
    public Date getCoreStartupDateTimeAsDate()
    {
        return getCoreStartupDateTimeAsDate(null);
    }

    /**
     * Returns the date and time the server was started.<p>
     * If either the date or time property is <code>null</code> (e.g. on Asterisk prior to 1.6.3) this method
     * returns <code>null</code>.
     *
     * @param tz the time zone of the Asterisk server, <code>null</code> to use the default time zone.
     * @return the date the server was started or <code>null</code> if not available.
     * @see #getCoreStartupDate()
     * @see #getCoreStartupTime()
     */
    public Date getCoreStartupDateTimeAsDate(TimeZone tz)
    {
        if (coreStartupDate == null || coreStartupTime == null)
        {
            return null;
        }

        return DateUtil.parseDateTime(coreStartupDate + " " + coreStartupTime, tz);
    }

    /**
     * Returns the number of currently active channels on the server.
     *
     * @return the number of currently active channels on the server.
     */
    public Integer getCoreCurrentCalls()
    {
        return coreCurrentCalls;
    }

    public void setCoreCurrentCalls(Integer coreCurrentCalls)
    {
        this.coreCurrentCalls = coreCurrentCalls;
    }
}
