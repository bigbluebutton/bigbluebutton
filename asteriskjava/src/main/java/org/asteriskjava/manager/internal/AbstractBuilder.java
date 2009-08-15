package org.asteriskjava.manager.internal;

import org.asteriskjava.manager.event.UserEvent;
import org.asteriskjava.util.AstUtil;
import org.asteriskjava.util.Log;
import org.asteriskjava.util.LogFactory;
import org.asteriskjava.util.ReflectionUtil;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Abstract base class for reflection based builders. 
 */
abstract class AbstractBuilder
{
    protected final Log logger = LogFactory.getLog(getClass());

    @SuppressWarnings("unchecked")
    protected void setAttributes(Object target, Map<String, Object> attributes, Set<String> ignoredAttributes)
    {
        Map<String, Method> setters;

        setters = ReflectionUtil.getSetters(target.getClass());
        for (Map.Entry<String, Object> entry : attributes.entrySet())
        {
            Object value;
            final Class dataType;
            Method setter;
            String setterName;

            if (ignoredAttributes != null && ignoredAttributes.contains(entry.getKey()))
            {
                continue;
            }

            setterName = ReflectionUtil.stripIllegalCharacters(entry.getKey());
            /*
             * The source property needs special handling as it is already
             * defined in java.util.EventObject (the base class of
             * ManagerEvent), so we have to translate it.
             */
            if ("source".equals(setterName))
            {
                setterName = "src";
            }

            setter = setters.get(setterName);
            if (setter == null && !setterName.endsWith("s")) // no exact match => try plural
            {
                setter = setters.get(setterName + "s");
                // but only for maps
                if (setter != null && ! (setter.getParameterTypes()[0].isAssignableFrom(Map.class)))
                {
                    setter = null;
                }
            }

            // it seems silly to warn if it's a user event -- maybe it was intentional
            if (setter == null && !(target instanceof UserEvent))
            {
                logger.warn("Unable to set property '" + entry.getKey() + "' to '" + entry.getValue() + "' on "
                        + target.getClass().getName() + ": no setter. Please report at http://jira.reucon.org/browse/AJ");
            }

            if (setter == null)
            {
                continue;
            }

            dataType = setter.getParameterTypes()[0];

            if (dataType == Boolean.class)
            {
                value = AstUtil.isTrue(entry.getValue());
            }
            else if (dataType.isAssignableFrom(String.class))
            {
                value = entry.getValue();
                if (AstUtil.isNull(value))
                {
                    value = null;
                }
            }
            else if (dataType.isAssignableFrom(Map.class))
            {
                if (entry.getValue() instanceof List)
                {
                    List<String> list = (List<String>) entry.getValue();
                    value = buildMap(list.toArray(new String[list.size()]));
                }
                else if (entry.getValue() instanceof String)
                {
                    value = buildMap((String) entry.getValue());
                }
                else
                {
                    value = null;
                }
            }
            else
            {
                try
                {
                    Constructor constructor = dataType.getConstructor(new Class[]{String.class});
                    value = constructor.newInstance(entry.getValue());
                }
                catch (Exception e)
                {
                    logger.error("Unable to convert value '" + entry.getValue() + "' of property '" + entry.getKey() + "' on "
                            + target.getClass().getName() + " to required type " + dataType, e);
                    continue;
                }
            }

            try
            {
                setter.invoke(target, value);
            }
            catch (Exception e)
            {
                logger.error("Unable to set property '" + entry.getKey() + "' to '" + entry.getValue() + "' on "
                        + target.getClass().getName(), e);
            }
        }
    }

    private Map<String, String> buildMap(String... lines)
    {
        if (lines == null)
        {
            return null;
        }

        final Map<String, String> map = new LinkedHashMap<String, String>();
        for (String line : lines)
        {
            final int index = line.indexOf('=');
            if (index > 0)
            {
                final String key = line.substring(0, index);
                final String value = line.substring(index + 1, line.length());
                map.put(key, value);
            }
            else
            {
                logger.warn("Malformed line '" + line + "' for a map property");
            }
        }
        return map;
    }
}
