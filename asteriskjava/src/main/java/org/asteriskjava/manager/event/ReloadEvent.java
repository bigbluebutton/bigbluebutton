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
 * A ReloadEvent is triggerd when the <code>reload</code> console command is executed or the
 * Asterisk server is started.<p>
 * It is implemented in <code>manager.c</code>
 *
 * @author srt
 * @version $Id: ReloadEvent.java 973 2008-02-03 16:21:12Z srt $
 */
public class ReloadEvent extends ManagerEvent
{
    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = 0L;

    public static final String MODULE_MANAGER = "Manager";
    public static final String MODULE_CDR = "CDR";
    public static final String MODULE_DNS_MGR = "DNSmgr";
    public static final String MODULE_RTP = "RTP";
    public static final String MODULE_ENUM = "ENUM";

    public static final String STATUS_ENABLED = "Enabled";
    public static final String STATUS_DISABLED = "Disabled";

    private String module;
    private String status;
    private String message;

    public ReloadEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the name of the module that has been reloaded.<p>
     * Available since Asterisk 1.6.
     *
     * @return the name of the module that has been reloaded.
     * @since 1.0.0
     */
    public String getModule()
    {
        return module;
    }

    /**
     * Sets the name of the module that has been reloaded.
     *
     * @param module the name of the module that has been reloaded.
     * @since 1.0.0
     */
    public void setModule(String module)
    {
        this.module = module;
    }

    /**
     * Returns the new status of the module.<p>
     * Available since Asterisk 1.6.
     *
     * @return "Enabled" if the module is endabled, "Disabled" if it is disabled.
     * @since 1.0.0
     * @see #STATUS_ENABLED
     * @see #STATUS_DISABLED
     * @see #isEnabled()
     * @see #isDisabled()
     */
    public String getStatus()
    {
        return status;
    }

    /**
     * Sets the new status of the module.
     *
     * @param status "Enabled" if the module is endabled, "Disabled" if it is disabled.
     * @since 1.0.0
     */
    public void setStatus(String status)
    {
        this.status = status;
    }

    public String getMessage()
    {
        return message;
    }

    public void setMessage(String message)
    {
        this.message = message;
    }

    /**
     * Returns whether the module is now enabled.<p>
     * Available since Asterisk 1.6.
     *
     * @return <code>true</code> the module is now enabled, <code>false</code> if it is disabled.
     *         For Asterisk versions up to 1.4 that do not support the "Status" property <code>false</code> is returned.
     * @see #getStatus()
     * @since 1.0.0
     */
    public boolean isEnabled()
    {
        return status != null && STATUS_ENABLED.equalsIgnoreCase(status);
    }

    /**
     * Returns whether the module is now disabled.<p>
     * Available since Asterisk 1.6.
     *
     * @return <code>true</code> the module is now disabled, <code>false</code> if it is enabled.
     *         For Asterisk versions up to 1.4 that do not support the "Status" property <code>false</code> is returned.
     * @see #getStatus()
     * @since 1.0.0
     */
    public boolean isDisabled()
    {
        return status != null && STATUS_DISABLED.equalsIgnoreCase(status);
    }
}
