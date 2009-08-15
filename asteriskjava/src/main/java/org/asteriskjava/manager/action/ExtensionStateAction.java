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
import org.asteriskjava.manager.response.ExtensionStateResponse;

/**
 * The ExtensionStateAction queries the state of an extension in a given context.
 * If the extension has a hint, will use devicestate to check the status of the
 * device connected to the extension.
 *
 * @author srt
 * @version $Id: ExtensionStateAction.java 1124 2008-08-18 03:25:01Z srt $
 */
@ExpectedResponse(ExtensionStateResponse.class)
public class ExtensionStateAction extends AbstractManagerAction
{
    static final long serialVersionUID = 6537408784388696403L;

    private String exten;
    private String context;

    /**
     * Creates a new ExtensionStateAction.
     */
    public ExtensionStateAction()
    {
    }

    /**
     * Creates a new ExtensionStateAction that queries the state of the given extension in
     * the given context.
     *
     * @param exten the extension to query.
     * @param context the name of the context that contains the extension to query.
     * @since 1.0.0
     */
    public ExtensionStateAction(String exten, String context)
    {
        this.exten = exten;
        this.context = context;
    }

    /**
     * Returns the name of this action, i.e. "ExtensionState".
     */
    @Override
    public String getAction()
    {
        return "ExtensionState";
    }

    /**
     * Returns the extension to query.
     *
     * @return the extension to query.
     */
    public String getExten()
    {
        return exten;
    }

    /**
     * Sets the extension to query.
     *
     * @param exten the extension to query.
     */
    public void setExten(String exten)
    {
        this.exten = exten;
    }

    /**
     * Returns the name of the context that contains the extension to query.
     *
     * @return the name of the context that contains the extension to query.
     */
    public String getContext()
    {
        return context;
    }

    /**
     * Sets the name of the context that contains the extension to query.
     *
     * @param context the name of the context that contains the extension to query.
     */
    public void setContext(String context)
    {
        this.context = context;
    }
}
