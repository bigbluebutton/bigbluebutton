/*
 *  Copyright 2005-2006 Stefan Reuter
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
package org.asteriskjava.live;

import java.io.Serializable;

public class Extension implements Serializable
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 768239042942945744L;
    private final String context;
    private final String extension;
    private final Integer priority;
    private final String application;
    private final String appData;

    /**
     * @param context
     * @param extension
     * @param priority
     */
    public Extension(String context, String extension, Integer priority)
    {
        this(context, extension, priority, null, null);
    }

    /**
     * @param context
     * @param extension
     * @param priority
     * @param application
     * @param appData
     */
    public Extension(String context, String extension,
                     Integer priority, String application, String appData)
    {
        this.context = context;
        this.extension = extension;
        this.priority = priority;
        this.application = application;
        this.appData = appData;
    }

    public String getContext()
    {
        return context;
    }

    public String getExtension()
    {
        return extension;
    }

    public Integer getPriority()
    {
        return priority;
    }

    public String getApplication()
    {
        return application;
    }

    public String getAppData()
    {
        return appData;
    }

    @Override
    public String toString()
    {
        StringBuffer sb;

        sb = new StringBuffer("Extension[");
        sb.append("context='").append(getContext()).append("',");
        sb.append("extension='").append(getExtension()).append("',");
        sb.append("priority='").append(getPriority()).append("',");
        sb.append("application='").append(getApplication()).append("',");
        sb.append("appData=").append(getAppData()).append("]");

        return sb.toString();
    }
}
