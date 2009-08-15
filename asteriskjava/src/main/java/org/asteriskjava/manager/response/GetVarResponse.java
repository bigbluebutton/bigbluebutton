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

/**
 * Corresponds to a GetVarAction and contains the value of the requested variable.
 *
 * @author srt
 * @version $Id: GetVarResponse.java 1153 2008-08-22 10:10:22Z srt $
 * @see org.asteriskjava.manager.action.GetVarAction
 * @since 1.0.0
 */
public class GetVarResponse extends ManagerResponse
{
    private static final long serialVersionUID = 1L;

    private String variable;
    private String value;

    /**
     * Returns the name of the requested variable.
     *
     * @return the name of the requested variable.
     */
    public String getVariable()
    {
        return variable;
    }

    /**
     * Sets the name of the requested variable.
     *
     * @param variable the name of the requested variable.
     */
    public void setVariable(String variable)
    {
        this.variable = variable;
    }

    /**
     * Returns the value of the requested variable.
     *
     * @return the value of the requested variable.
     */
    public String getValue()
    {
        return value;
    }

    /**
     * Sets the value of the requested variable.
     *
     * @param value the value of the requested variable.
     */
    public void setValue(String value)
    {
        this.value = value;
    }
}