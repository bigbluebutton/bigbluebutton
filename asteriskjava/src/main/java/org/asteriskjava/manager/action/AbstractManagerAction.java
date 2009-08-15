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

import java.lang.reflect.Method;
import java.util.Map;

import org.asteriskjava.util.ReflectionUtil;

/**
 * This class implements the ManagerAction interface and can serve as base class
 * for your concrete Action implementations.
 * 
 * @author srt
 * @version $Id: AbstractManagerAction.java 1140 2008-08-18 18:49:36Z srt $
 * @since 0.2
 */
public abstract class AbstractManagerAction implements ManagerAction
{
    /**
     * Serializable version identifier.
     */
    static final long serialVersionUID = -7667827187378395689L;

    private String actionId;

    public abstract String getAction();

    public String getActionId()
    {
        return actionId;
    }

    public void setActionId(String actionId)
    {
        this.actionId = actionId;
    }

    @Override
    public String toString()
    {
        StringBuffer sb;
        Map<String, Method> getters;

        sb = new StringBuffer(getClass().getName() + "[");
        sb.append("action='").append(getAction()).append("',");
        getters = ReflectionUtil.getGetters(getClass());
        for (Map.Entry<String, Method> entry : getters.entrySet())
        {
            final String attribute = entry.getKey();
            if ("action".equals(attribute) || "class".equals(attribute))
            {
                continue;
            }

            try
            {
                Object value;
                value = entry.getValue().invoke(this);
                sb.append(attribute).append("='").append(value).append("',");
            }
            catch (Exception e) // NOPMD
            {
                // swallow
            }
        }
        sb.append("systemHashcode=").append(System.identityHashCode(this));
        sb.append("]");

        return sb.toString();
    }
}
