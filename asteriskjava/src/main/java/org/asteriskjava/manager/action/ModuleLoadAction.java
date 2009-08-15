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
 * The ModuleLoadAction loads, unloads or reloads Asterisk modules.<p>
 * Available since Asterisk 1.6
 *
 * @author srt
 * @version $Id: ModuleLoadAction.java 1123 2008-08-17 11:26:34Z srt $
 * @since 1.0.0
 */
public class ModuleLoadAction extends AbstractManagerAction
{
    static final long serialVersionUID = 1L;

    public static final String SUBSYSTEM_CDR = "cdr";
    public static final String SUBSYSTEM_ENUM = "enum";
    public static final String SUBSYSTEM_DNSMGR = "dnsmgr";
    public static final String SUBSYSTEM_EXTCONFIG = "extconfig";
    public static final String SUBSYSTEM_MANAGER = "manager";
    public static final String SUBSYSTEM_RTP = "rtp";
    public static final String SUBSYSTEM_HTTP = "http";

    public static final String LOAD_TYPE_LOAD = "load";
    public static final String LOAD_TYPE_UNLOAD = "unload";
    public static final String LOAD_TYPE_RELOAD = "reload";

    private String module;
    private String loadType;

    /**
     * Creates a new ModuleLoadAction.
     */
    public ModuleLoadAction()
    {

    }

    /**
     * Creates a new ModuleLoadAction with the given parameters.
     *
     * @param module   the name of the module including the ".so" extension or subsystem
     *                 to perform the operation on or <code>null</code> combined with loadType "reload"
     *                 to reload all modules.
     * @param loadType the operation to perform ("load", "unload" or "reload").
     */
    public ModuleLoadAction(String module, String loadType)
    {
        this.module = module;
        this.loadType = loadType;
    }

    /**
     * Returns the name of this action, i.e. "ModuleLoad".
     */
    @Override
    public String getAction()
    {
        return "ModuleLoad";
    }

    /**
     * Returns the name of the module or subsystem to perform the operation on.
     *
     * @return the name of the module or subsystem to perform the operation on.
     */
    public String getModule()
    {
        return module;
    }

    /**
     * Sets the name of the module including the ".so" extension or subsystem ("cdr", "enum", "dnsmgr",
     * "extconfig", "manager", "rtp" or "http") to perform the operation on.
     *
     * @param module the name of the module including the ".so" extension or subsystem
     *               to perform the operation on or <code>null</code> combined with loadType "reload"
     *               to reload all modules.
     * @see #SUBSYSTEM_CDR
     * @see #SUBSYSTEM_ENUM
     * @see #SUBSYSTEM_DNSMGR
     * @see #SUBSYSTEM_EXTCONFIG
     * @see #SUBSYSTEM_MANAGER
     * @see #SUBSYSTEM_RTP
     * @see #SUBSYSTEM_HTTP
     */
    public void setModule(String module)
    {
        this.module = module;
    }

    /**
     * Returns the operation to perform.
     *
     * @return the operation to perform.
     */
    public String getLoadType()
    {
        return loadType;
    }

    /**
     * Sets the operation to perform ("load", "unload" or "reload").
     *
     * @param loadType the operation to perform ("load", "unload" or "reload").
     * @see #LOAD_TYPE_LOAD
     * @see #LOAD_TYPE_UNLOAD
     * @see #LOAD_TYPE_RELOAD
     */
    public void setLoadType(String loadType)
    {
        this.loadType = loadType;
    }
}