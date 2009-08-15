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
package org.asteriskjava.util;

import java.lang.reflect.Method;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Utility class that provides helper methods for reflection that is used by the
 * fastagi and manager packages to access getter and setter methods.<p>
 * Client code is not supposed to use this class.
 *
 * @author srt
 */
public class ReflectionUtil
{
    private ReflectionUtil()
    {
        // hide constructor
    }

    /**
     * Returns a Map of getter methods of the given class.<p>
     * The key of the map contains the name of the attribute that can be
     * accessed by the getter, the value the getter itself (an instance of
     * java.lang.reflect.Method). A method is considered a getter if its name
     * starts with "get", it is declared public and takes no arguments.
     *
     * @param clazz the class to return the getters for
     * @return a Map of attributes and their accessor methods (getters)
     */
    public static Map<String, Method> getGetters(final Class clazz)
    {
        final Map<String, Method> accessors = new HashMap<String, Method>();
        final Method[] methods = clazz.getMethods();

        for (Method method : methods)
        {
            String name;
            String methodName;

            methodName = method.getName();
            if (!methodName.startsWith("get"))
            {
                continue;
            }

            // skip methods with != 0 parameters
            if (method.getParameterTypes().length != 0)
            {
                continue;
            }

            // ok seems to be an accessor
            name = methodName.substring("get".length()).toLowerCase(Locale.ENGLISH);

            if (name.length() == 0)
            {
                continue;
            }

            accessors.put(name, method);
        }

        return accessors;
    }

    /**
     * Returns a Map of setter methods of the given class.<p>
     * The key of the map contains the name of the attribute that can be
     * accessed by the setter, the value the setter itself (an instance of
     * java.lang.reflect.Method). A method is considered a setter if its name
     * starts with "set", it is declared public and takes exactly one argument.
     *
     * @param clazz the class to return the setters for
     * @return a Map of attributes and their accessor methods (setters)
     */
    public static Map<String, Method> getSetters(Class clazz)
    {
        final Map<String, Method> accessors = new HashMap<String, Method>();
        final Method[] methods = clazz.getMethods();

        for (Method method : methods)
        {
            String name;
            String methodName;

            methodName = method.getName();
            if (!methodName.startsWith("set"))
            {
                continue;
            }

            // skip methods with != 1 parameters
            if (method.getParameterTypes().length != 1)
            {
                continue;
            }

            // ok seems to be an accessor
            name = methodName.substring("set".length()).toLowerCase(Locale.US);
            accessors.put(name, method);
        }

        return accessors;
    }


    /**
     * Strips all illegal charaters from the given lower case string.
     * Illegal characters are all characters that are neither characters ('a' to 'z') nor digits ('0' to '9').
     *
     * @param s the original string
     * @return the string with all illegal characters stripped
     */
    public static String stripIllegalCharacters(String s)
    {
        char c;
        boolean needsStrip = false;
        StringBuffer sb;

        if (s == null)
        {
            return null;
        }

        for (int i = 0; i < s.length(); i++)
        {
            c = s.charAt(i);
            if (c >= '0' && c <= '9')
            {
                // continue
            } // NOPMD
            else if (c >= 'a' && c <= 'z')
            {
                // continue
            } // NOPMD
            else
            {
                needsStrip = true;
                break;
            }
        }

        if (!needsStrip)
        {
            return s;
        }

        sb = new StringBuffer(s.length());
        for (int i = 0; i < s.length(); i++)
        {
            c = s.charAt(i);
            if (c >= '0' && c <= '9')
            {
                sb.append(c);
            }
            else if (c >= 'a' && c <= 'z')
            {
                sb.append(c);
            }
        }

        return sb.toString();
    }

    /**
     * Checks if the class is available on the current thread's context class loader.
     *
     * @param s fully qualified name of the class to check.
     * @return <code>true</code> if the class is available, <code>false</code> otherwise.
     */
    public static boolean isClassAvailable(String s)
    {
        final ClassLoader classLoader = Thread.currentThread().getContextClassLoader();

        try
        {
            classLoader.loadClass(s);
            return true;
        }
        catch (ClassNotFoundException e)
        {
            return false;
        }
    }

    /**
     * Creates a new instance of the given class. The class is loaded using the current thread's context
     * class loader and instantiated using its default constructor.
     *
     * @param s fully qualified name of the class to instantiate.
     * @return the new instance or <code>null</code> on failure.
     */
    public static Object newInstance(String s)
    {
        final ClassLoader classLoader = Thread.currentThread().getContextClassLoader();

        try
        {
            Class clazz = classLoader.loadClass(s);
            Constructor constructor = clazz.getConstructor();
            return constructor.newInstance();
        }
        catch (ClassNotFoundException e)
        {
            return null;
        }
        catch (IllegalAccessException e)
        {
            return null;
        }
        catch (InstantiationException e)
        {
            return null;
        }
        catch (NoSuchMethodException e)
        {
            // no default constructor
            return null;
        }
        catch (InvocationTargetException e)
        {
            // constructor threw an exception
            return null;
        }
    }
}
