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
import org.asteriskjava.manager.response.CoreSettingsResponse;

/**
 * The CoreStatusAction requests a settings summary from the server. The settings
 * include the version, system name, and various system limits.<p>
 * It returns a {@link org.asteriskjava.manager.response.CoreSettingsResponse}.<p>
 * Available since Asterisk 1.6.0
 *
 * @author srt
 * @version $Id: CoreSettingsAction.java 1298 2009-04-29 23:31:56Z srt $
 * @see org.asteriskjava.manager.response.CoreSettingsResponse
 * @since 1.0.0
 */
@ExpectedResponse(CoreSettingsResponse.class)
public class CoreSettingsAction extends AbstractManagerAction
{
    static final long serialVersionUID = 1L;

    /**
     * Creates a new CoreSettingsAction.
     */
    public CoreSettingsAction()
    {

    }

    /**
     * Returns the name of this action, i.e. "CoreSettings".
     */
    @Override
    public String getAction()
    {
        return "CoreSettings";
    }
}