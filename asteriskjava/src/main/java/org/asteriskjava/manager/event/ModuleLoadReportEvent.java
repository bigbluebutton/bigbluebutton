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
 * A ModuleLoadReportEvent is triggerd when Asterisk has completed loading its modules.<p>
 * It is implemented in <code>main/loader.c</code>
 *
 * @author srt
 * @version $Id: ModuleLoadReportEvent.java 1149 2008-08-21 18:29:12Z srt $
 * @since 1.0.0
 */
public class ModuleLoadReportEvent extends ManagerEvent
{
    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = 0L;

    public static final String MODULE_SELECTION_PRELOAD = "Preload";
    public static final String MODULE_SELECTION_ALL = "All";

    public static final String MODULE_LOAD_STATUS_DONE = "Done";

    private String moduleLoadStatus;
    private String moduleSelection;
    private Integer moduleCount;

    public ModuleLoadReportEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the load status. Currently this is always "Done".
     *
     * @return the load status.
     * @see #MODULE_LOAD_STATUS_DONE
     */
    public String getModuleLoadStatus()
    {
        return moduleLoadStatus;
    }

    public void setModuleLoadStatus(String moduleLoadStatus)
    {
        this.moduleLoadStatus = moduleLoadStatus;
    }

    /**
     * Returns whether loading the pre-load modules has been completed or all modules
     * have been loaded. 
     *
     * @return "Preload" or "All"
     * @see #MODULE_SELECTION_PRELOAD
     * @see #MODULE_SELECTION_ALL
     */
    public String getModuleSelection()
    {
        return moduleSelection;
    }

    public boolean isPreload()
    {
        return MODULE_SELECTION_PRELOAD.equals(moduleSelection);
    }

    public boolean isAll()
    {
        return MODULE_SELECTION_ALL.equals(moduleSelection);
    }

    public void setModuleSelection(String moduleSelection)
    {
        this.moduleSelection = moduleSelection;
    }

    /**
     * Returns the number of modules that have been loaded.
     *
     * @return the number of modules that have been loaded.
     */
    public Integer getModuleCount()
    {
        return moduleCount;
    }

    public void setModuleCount(Integer moduleCount)
    {
        this.moduleCount = moduleCount;
    }
}