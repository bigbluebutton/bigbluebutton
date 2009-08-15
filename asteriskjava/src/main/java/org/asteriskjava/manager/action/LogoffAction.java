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
 * The LogoffAction causes the server to close the connection.
 * 
 * @author srt
 * @version $Id: LogoffAction.java 938 2007-12-31 03:23:38Z srt $
 */
public class LogoffAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier
     */
    static final long serialVersionUID = -7576797478570238525L;

    /**
     * Creates a new LogoffAction.
     */
    public LogoffAction()
    {

    }

    /**
     * Returns the name of this action, i.e. "Logoff".
     */
    @Override
   public String getAction()
    {
        return "Logoff";
    }
}
