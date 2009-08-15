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
import org.asteriskjava.manager.response.CoreStatusResponse;

/**
 * The CoreStatusAction requests a status summary from the server.<p>
 * It returns a {@link org.asteriskjava.manager.response.CoreStatusResponse}.<p>
 * Available since Asterisk 1.6.0
 *
 * @author srt
 * @version $Id: CoreStatusAction.java 1127 2008-08-18 10:30:04Z srt $
 * @see org.asteriskjava.manager.response.CoreStatusResponse
 * @since 1.0.0
 */
@ExpectedResponse(CoreStatusResponse.class)
public class CoreStatusAction extends AbstractManagerAction
{
    static final long serialVersionUID = 1L;

    /**
     * Creates a new CoreStatusAction.
     */
    public CoreStatusAction()
    {

    }

    /**
     * Returns the name of this action, i.e. "CoreStatus".
     */
    @Override
    public String getAction()
    {
        return "CoreStatus";
    }
}