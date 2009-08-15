/*
 *  Copyright 2004-2006 Stefan Reuter and others
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
package org.asteriskjava.manager.internal;

import org.asteriskjava.AsteriskVersion;
import org.asteriskjava.manager.AsteriskMapping;
import org.asteriskjava.manager.action.ManagerAction;
import org.asteriskjava.manager.action.UserEventAction;
import org.asteriskjava.manager.event.UserEvent;
import org.asteriskjava.util.Log;
import org.asteriskjava.util.LogFactory;
import org.asteriskjava.util.ReflectionUtil;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.*;

/**
 * Default implementation of the ActionBuilder interface.
 *
 * @author srt
 * @version $Id: ActionBuilderImpl.java 1286 2009-04-04 09:40:40Z srt $
 */
class ActionBuilderImpl implements ActionBuilder
{
    private static final String LINE_SEPARATOR = "\r\n";
    private static final String ATTRIBUTES_PROPERTY_NAME = "attributes";

    /**
     * Instance logger.
     */
    private final Log logger = LogFactory.getLog(getClass());
    private AsteriskVersion targetVersion;

    /**
     * Creates a new ActionBuilder for Asterisk 1.0.
     */
    ActionBuilderImpl()
    {
        this.targetVersion = AsteriskVersion.ASTERISK_1_0;
    }

    public void setTargetVersion(AsteriskVersion targetVersion)
    {
        this.targetVersion = targetVersion;
    }

    public String buildAction(final ManagerAction action)
    {
        return buildAction(action, null);
    }

    @SuppressWarnings("unchecked")
    public String buildAction(final ManagerAction action, final String internalActionId)
    {
        StringBuffer sb = new StringBuffer();

        sb.append("action: ");
        sb.append(action.getAction());
        sb.append(LINE_SEPARATOR);
        if (internalActionId != null)
        {
            sb.append("actionid: ");
            sb.append(ManagerUtil.addInternalActionId(action.getActionId(), internalActionId));
            sb.append(LINE_SEPARATOR);
        }
        else if (action.getActionId() != null)
        {
            sb.append("actionid: ");
            sb.append(action.getActionId());
            sb.append(LINE_SEPARATOR);
        }

        /*
         * When using the Reflection API to get all of the getters for building
         * actions to send, we ignore some of the getters
         */
        Set<String> ignore = new HashSet<String>();
        ignore.add("class");
        ignore.add("action");
        ignore.add("actionid");
        ignore.add(ATTRIBUTES_PROPERTY_NAME);

        // if this is a user event action, we need to grab the internal event,
        // otherwise do below as normal
        if (action instanceof UserEventAction)
        {
            UserEvent userEvent = ((UserEventAction) action).getUserEvent();
            appendUserEvent(sb, userEvent);

            // eventually we may want to add more Map keys for events to ignore
            // when appending
            appendGetters(sb, userEvent, ignore);
        }
        else
        {
            appendGetters(sb, action, ignore);
        }

        // actions that have the special getAttributes method will
        // have their Map appended without a singular key or separator
        Map<String, Method> getters = ReflectionUtil.getGetters(action.getClass());
        
        if(getters.containsKey(ATTRIBUTES_PROPERTY_NAME))
        {
            Method getter = getters.get(ATTRIBUTES_PROPERTY_NAME);
            Object value = null;
            try
            {
                value = getter.invoke(action);
            }
            catch (Exception ex)
            {
                logger.error("Unable to retrieve property '" + ATTRIBUTES_PROPERTY_NAME + "' of " + action.getClass(), ex);
            }
            
            if(value instanceof Map)
            {
                Map<Object,Object> attributes = (Map)value;
                for (Map.Entry entry : attributes.entrySet())
                {
                    appendString(sb, entry.getKey() == null ? "null" : entry.getKey().toString(),
                            entry.getValue() == null ? "null" : entry.getValue().toString());
                }   
            }
        }
        
        sb.append(LINE_SEPARATOR);
        return sb.toString();
    }

    private void appendMap(StringBuffer sb, String key, Map<String, String> values)
    {
        String singularKey;

        // strip plural s (i.e. use "variable: " instead of "variables: "
        if (key.endsWith("s"))
        {
            singularKey = key.substring(0, key.length() - 1);
        }
        else
        {
            singularKey = key;
        }

        if (targetVersion.isAtLeast(AsteriskVersion.ASTERISK_1_2))
        {
            appendMap12(sb, singularKey, values);
        }
        else
        {
            appendMap10(sb, singularKey, values);
        }
    }

    private void appendMap10(StringBuffer sb, String singularKey, Map<String, String> values)
    {
        Iterator<Map.Entry<String, String>> entryIterator;

        sb.append(singularKey);
        sb.append(": ");
        entryIterator = values.entrySet().iterator();
        while (entryIterator.hasNext())
        {
            Map.Entry entry;

            entry = entryIterator.next();
            sb.append(entry.getKey());
            sb.append("=");
            if (entry.getValue() != null)
            {
                sb.append(entry.getValue());
            }

            if (entryIterator.hasNext())
            {
                sb.append("|");
            }
        }
        sb.append(LINE_SEPARATOR);
    }

    private void appendMap12(StringBuffer sb, String singularKey, Map<String, String> values)
    {
        for (Map.Entry entry : values.entrySet())
        {
            sb.append(singularKey);
            sb.append(": ");
            sb.append(entry.getKey());
            sb.append("=");
            if (entry.getValue() != null)
            {
                sb.append(entry.getValue());
            }

            sb.append(LINE_SEPARATOR);
        }
    }

    private void appendString(StringBuffer sb, String key, String value)
    {
        sb.append(key);
        sb.append(": ");
        sb.append(value);
        sb.append(LINE_SEPARATOR);
    }

    private void appendUserEvent(StringBuffer sb, UserEvent event)
    {
        Class clazz = event.getClass();

        String className = clazz.getName();
        String eventType = className.substring(className.lastIndexOf('.') + 1).toLowerCase(Locale.ENGLISH);

        if (eventType.endsWith("event"))
        {
            eventType = eventType.substring(0, eventType.length() - "event".length());
        }

        appendString(sb, "UserEvent", eventType);
    }

    @SuppressWarnings("unchecked")
    private void appendGetters(StringBuffer sb, Object action, Set<String> membersToIgnore)
    {
        Map<String, Method> getters = ReflectionUtil.getGetters(action.getClass());
        for (Map.Entry<String, Method> entry : getters.entrySet())
        {
            final String name = entry.getKey();
            final Method getter = entry.getValue();
            final Object value;

            if (membersToIgnore.contains(name))
            {
                continue;
            }

            try
            {
                value = getter.invoke(action);
            }
            catch (Exception ex)
            {
                logger.error("Unable to retrieve property '" + name + "' of " + action.getClass(), ex);
                continue;
            }

            if (value == null || value instanceof Class)
            {
                continue;
            }

            final String mappedName = mapToAsterisk(getter);
            if (value instanceof Map)
            {
                appendMap(sb, mappedName, (Map) value);
            }
            else if (value instanceof String)
            {
                appendString(sb, mappedName, (String) value);
            }
            else
            {
                appendString(sb, mappedName, value.toString());
            }
        }
    }

    private String mapToAsterisk(Method getter)
    {
        AsteriskMapping annotation;

        // check annotation of getter method
        annotation = getter.getAnnotation(AsteriskMapping.class);
        if (annotation != null)
        {
            return annotation.value();
        }

        // check annotation of setter method
        String setterName = determineSetterName(getter.getName());
        try
        {
            Method setter = getter.getDeclaringClass().getDeclaredMethod(setterName, getter.getReturnType());
            annotation = setter.getAnnotation(AsteriskMapping.class);
            if (annotation != null)
            {
                return annotation.value();
            }
        }
        catch (NoSuchMethodException e)
        {
            // ok, no setter method
        }

        // check annotation of field
        String fieldName = determineFieldName(getter.getName());
        try
        {
            Field field = getter.getDeclaringClass().getDeclaredField(fieldName);
            annotation = field.getAnnotation(AsteriskMapping.class);
            if (annotation != null)
            {
                return annotation.value();
            }
        }
        catch (NoSuchFieldException e)
        {
            // ok, no field
        }

        return fieldName.toLowerCase(Locale.US);
    }

    String determineSetterName(String getterName)
    {
        if (getterName.startsWith("get"))
        {
            return "set" + getterName.substring(3);
        }
        else if (getterName.startsWith("is"))
        {
            return "set" + getterName.substring(2);
        }
        else
        {
            throw new IllegalArgumentException("Getter '" + getterName + "' doesn't start with either 'get' or 'is'");
        }
    }

    String determineFieldName(String accessorName)
    {
        if (accessorName.startsWith("get"))
        {
            return lcFirst(accessorName.substring(3));
        }
        else if (accessorName.startsWith("is"))
        {
            return lcFirst(accessorName.substring(2));
        }
        else if (accessorName.startsWith("set"))
        {
            return lcFirst(accessorName.substring(3));
        }
        else
        {
            throw new IllegalArgumentException("Accessor '" + accessorName + "' doesn't start with either 'get', 'is' or 'set'");
        }
    }

    /**
     * Converts the first character to lower case.
     *
     * @param s the string to convert.
     * @return the converted string.
     */
    String lcFirst(String s)
    {
        if (s == null || s.length() < 1)
        {
            return s;
        }

        char first = s.charAt(0);
        return Character.toLowerCase(first) + s.substring(1);
    }
}
