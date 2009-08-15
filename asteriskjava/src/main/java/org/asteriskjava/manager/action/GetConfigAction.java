/*
 *  Copyright 2004-2007 Stefan Reuter and others
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
import org.asteriskjava.manager.response.GetConfigResponse;

/**
 * The GetConfigAction sends a GetConfig command to the Asterisk server.<p>
 * The GetConfigAction returns a GetConfigResponse.
 *
 * @author martins
 * @see org.asteriskjava.manager.response.GetConfigResponse
 * @since 0.3
 */
@ExpectedResponse(GetConfigResponse.class)
public class GetConfigAction extends AbstractManagerAction
{
    static final long serialVersionUID = 4753117770471622025L;
    private String filename;

    /**
     * Creates a new GetConfigAction.
     */
    public GetConfigAction()
    {

    }

    /**
     * Creates a new GetConfigAction with the given filename.
     *
     * @param filename the name of the file to get.
     */
    public GetConfigAction(String filename)
    {
        this.filename = filename;
    }

    /**
     * Returns the name of this action, i.e. "GetConfig".
     */
    @Override
    public String getAction()
    {
        return "GetConfig";
    }

    /**
     * Returns the filename.
     */
    public String getFilename()
    {
        return filename;
    }

    /**
     * Sets filename.
     */
    public void setFilename(String filename)
    {
        this.filename = filename;
    }
}
