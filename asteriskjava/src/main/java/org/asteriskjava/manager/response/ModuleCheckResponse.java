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
 * Corresponds to a ModuleCheckAction and contains the version of the module.
 *
 * @author srt
 * @version $Id: ModuleCheckResponse.java 1132 2008-08-18 13:00:35Z srt $
 * @see org.asteriskjava.manager.action.ModuleCheckAction
 * @since 1.0.0
 */
public class ModuleCheckResponse extends ManagerResponse
{
    private static final long serialVersionUID = -7253724086340850957L;

    private Integer version;

    /**
     * Returns the version (svn revision) of the module.
     *
     * @return the version (svn revision) of the module.
     */
    public Integer getVersion()
    {
        return version;
    }

    public void setVersion(Integer version)
    {
        this.version = version;
    }
}