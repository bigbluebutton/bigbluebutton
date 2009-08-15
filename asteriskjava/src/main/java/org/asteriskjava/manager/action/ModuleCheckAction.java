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

import org.asteriskjava.manager.ExpectedResponse;
import org.asteriskjava.manager.response.ModuleCheckResponse;

/**
 * The ModuleLoadAction checks if an Asterisk module is loaded and reports its version.<p>
 * The ModuleLoadAction returns a {@link org.asteriskjava.manager.response.ModuleCheckResponse} with
 * the version of the module if the module is loaded and a {@link org.asteriskjava.manager.response.ManagerError}
 * if the module is not loaded.<p>
 * Available since Asterisk 1.6
 *
 * @author srt
 * @version $Id: ModuleCheckAction.java 1132 2008-08-18 13:00:35Z srt $
 * @since 1.0.0
 */
@ExpectedResponse(ModuleCheckResponse.class)
public class ModuleCheckAction extends AbstractManagerAction
{
    static final long serialVersionUID = 1L;

    private String module;

    /**
     * Creates a new ModuleCheckAction.
     */
    public ModuleCheckAction()
    {

    }

    /**
     * Creates a new ModuleCheckAction with the given parameters.
     *
     * @param module the name of the module (including or not including the ".so" extension).
     */
    public ModuleCheckAction(String module)
    {
        this.module = module;
    }

    /**
     * Returns the name of this action, i.e. "ModuleLoad".
     */
    @Override
    public String getAction()
    {
        return "ModuleCheck";
    }

    /**
     * Returns the name of the module to check.
     *
     * @return the name of the module to check.
     */
    public String getModule()
    {
        return module;
    }

    /**
     * Sets the name of the module (including or not including the ".so" extension) to check.
     *
     * @param module the name of the module (including or not including the ".so" extension) to check.
     */
    public void setModule(String module)
    {
        this.module = module;
    }
}