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
package org.asteriskjava.fastagi.internal;

import org.asteriskjava.fastagi.AgiRequest;
import org.asteriskjava.util.AstUtil;
import org.asteriskjava.util.Log;
import org.asteriskjava.util.LogFactory;

import java.io.UnsupportedEncodingException;
import java.net.InetAddress;
import java.net.URLDecoder;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


/**
 * Default implementation of the AGIRequest interface.
 * 
 * @author srt
 * @version $Id: AgiRequestImpl.java 1287 2009-04-04 09:48:03Z srt $
 */
public class AgiRequestImpl implements AgiRequest
{
    private final Log logger = LogFactory.getLog(getClass());
    private static final Pattern SCRIPT_PATTERN = Pattern.compile("^([^\\?]*)\\?(.*)$");
    private static final Pattern PARAMETER_PATTERN = Pattern.compile("^(.*)=(.*)$");

    private String rawCallerId;

    private Map<String, String> request;

    /**
     * A map assigning the values of a parameter (an array of Strings) to the
     * name of the parameter.
     */
    private Map<String, String[]> parameterMap;

    private String[] arguments;

    private String parameters;
    private String script;
    private boolean callerIdCreated;
    private InetAddress localAddress;
    private int localPort;
    private InetAddress remoteAddress;
    private int remotePort;

    /**
     * Creates a new AGIRequestImpl.
     * 
     * @param environment the first lines as received from Asterisk containing
     *            the environment.
     */
    AgiRequestImpl(final List<String> environment)
    {
        this(buildMap(environment));
    }

    /**
     * Creates a new AgiRequestImpl based on a preparsed map of parameters.
     *
     * @param request a map representing the AGI request. Keys must not contain the "agi_" or "ogi_" prefix.
     * @since 1.0.0
     */
    private AgiRequestImpl(final Map<String, String> request)
    {
        this.request = request;

        script = request.get("network_script");
        if (script != null)
        {
            Matcher scriptMatcher = SCRIPT_PATTERN.matcher(script);
            if (scriptMatcher.matches())
            {
                script = scriptMatcher.group(1);
                parameters = scriptMatcher.group(2);
            }
        }
    }

    /**
     * Builds a map containing variable names as key (with the "agi_" or "ogi_" prefix
     * stripped) and the corresponding values.<p>
     * Syntactically invalid and empty variables are skipped.
     * 
     * @param lines the environment to transform.
     * @return a map with the variables set corresponding to the given environment.
     * @throws IllegalArgumentException if lines is <code>null</code>
     */
    private static Map<String, String> buildMap(final Collection<String> lines) throws IllegalArgumentException
    {
        final Map<String, String> map;

        if (lines == null)
        {
            throw new IllegalArgumentException("Environment must not be null.");
        }

        map = new HashMap<String, String>();

        for (String line : lines)
        {
            int colonPosition;
            String key;
            String value;

            colonPosition = line.indexOf(':');

            // no colon on the line?
            if (colonPosition < 0)
            {
                continue;
            }

            // key doesn't start with agi_ or ogi_?
            if (!line.startsWith("agi_") && !line.startsWith("ogi_"))
            {
                continue;
            }

            // first colon in line is last character -> no value present?
            if (line.length() < colonPosition + 2)
            {
                continue;
            }

            key = line.substring(4, colonPosition).toLowerCase(Locale.ENGLISH);
            value = line.substring(colonPosition + 2);

            if (value.length() != 0)
            {
                map.put(key, value);
            }
        }

        return map;
    }

    public Map<String, String> getRequest()
    {
        return request;
    }

    /**
     * Returns the name of the script to execute.
     * 
     * @return the name of the script to execute.
     */
    public synchronized String getScript()
    {
        return script;
    }

    /**
     * Returns the full URL of the request in the form
     * agi://host[:port][/script].
     * 
     * @return the full URL of the request in the form
     *         agi://host[:port][/script].
     */
    public String getRequestURL()
    {
        return request.get("request");
    }

    /**
     * Returns the name of the channel.
     * 
     * @return the name of the channel.
     */
    public String getChannel()
    {
        return request.get("channel");
    }

    /**
     * Returns the unqiue id of the channel.
     * 
     * @return the unqiue id of the channel.
     */
    public String getUniqueId()
    {
        return request.get("uniqueid");
    }

    public String getType()
    {
        return request.get("type");
    }

    public String getLanguage()
    {
        return request.get("language");
    }

    public String getCallerId()
    {
        return getCallerIdNumber();
    }

    public String getCallerIdNumber()
    {
        String callerIdName;
        String callerId;

        callerIdName = request.get("calleridname");
        callerId = request.get("callerid");
        if (callerIdName != null)
        {
            // Asterisk 1.2
            if (callerId == null || "unknown".equals(callerId))
            {
                return null;
            }

            return callerId;
        }
        else
        {
            // Asterisk 1.0
            return getCallerId10();
        }
    }

    public String getCallerIdName()
    {
        String callerIdName;

        callerIdName = request.get("calleridname");
        if (callerIdName != null)
        {
            // Asterisk 1.2
            if ("unknown".equals(callerIdName))
            {
                return null;
            }

            return callerIdName;
        }
        else
        {
            // Asterisk 1.0
            return getCallerIdName10();
        }
    }

    /**
     * Returns the Caller*ID number using Asterisk 1.0 logic.
     * 
     * @return the Caller*ID number
     */
    private synchronized String getCallerId10()
    {
        final String[] parsedCallerId;

        if (!callerIdCreated)
        {
            rawCallerId = request.get("callerid");
            callerIdCreated = true;
        }

        parsedCallerId = AstUtil.parseCallerId(rawCallerId);
        if (parsedCallerId[1] == null)
        {
            return parsedCallerId[0];
        }
        else
        {
            return parsedCallerId[1];
        }
    }

    /**
     * Returns the Caller*ID name using Asterisk 1.0 logic.
     * 
     * @return the Caller*ID name
     */
    private synchronized String getCallerIdName10()
    {
        if (!callerIdCreated)
        {
            rawCallerId = request.get("callerid");
            callerIdCreated = true;
        }

        return AstUtil.parseCallerId(rawCallerId)[0];
    }

    public String getDnid()
    {
        String dnid;
        
        dnid = request.get("dnid");
        
        if (dnid == null || "unknown".equals(dnid))
        {
            return null;
        }
        
        return dnid; 
    }

    public String getRdnis()
    {
        String rdnis;
        
        rdnis = request.get("rdnis");
        
        if (rdnis == null || "unknown".equals(rdnis))
        {
            return null;
        }
        
        return rdnis; 
    }

    public String getContext()
    {
        return request.get("context");
    }

    public String getExtension()
    {
        return request.get("extension");
    }

    public Integer getPriority()
    {
        if (request.get("priority") != null)
        {
            return Integer.valueOf(request.get("priority"));
        }
        return null;
    }

    public Boolean getEnhanced()
    {
        if (request.get("enhanced") != null)
        {
            if ("1.0".equals(request.get("enhanced")))
            {
                return Boolean.TRUE;
            }
            else
            {
                return Boolean.FALSE;
            }
        }
        return null;
    }

    public String getAccountCode()
    {
        return request.get("accountcode");
    }

    public Integer getCallingAni2()
    {
        if (request.get("callingani2") == null)
        {
            return null;
        }

        try
        {
            return Integer.valueOf(request.get("callingani2"));
        }
        catch (NumberFormatException e)
        {
            return null;
        }
    }

    public Integer getCallingPres()
    {
        if (request.get("callingpres") == null)
        {
            return null;
        }
        
        try
        {
            return Integer.valueOf(request.get("callingpres"));
        }
        catch (NumberFormatException e)
        {
            return null;
        }
    }

    public Integer getCallingTns()
    {
        if (request.get("callingtns") == null)
        {
            return null;
        }
        
        try
        {
            return Integer.valueOf(request.get("callingtns"));
        }
        catch (NumberFormatException e)
        {
            return null;
        }
    }

    public Integer getCallingTon()
    {
        if (request.get("callington") == null)
        {
            return null;
        }
        
        try
        {
            return Integer.valueOf(request.get("callington"));
        }
        catch (NumberFormatException e)
        {
            return null;
        }
    }

    public String getParameter(String name)
    {
        String[] values;

        values = getParameterValues(name);

        if (values == null || values.length == 0)
        {
            return null;
        }

        return values[0];
    }

    public synchronized String[] getParameterValues(String name)
    {
        if (getParameterMap().isEmpty())
        {
            return new String[0];
        }

        final String[] values = parameterMap.get(name);
        return values == null ? new String[0] : values;
    }

    public synchronized Map<String, String[]> getParameterMap()
    {
        if (parameterMap == null)
        {
            parameterMap = parseParameters(parameters);
        }
        return parameterMap;
    }

    /**
     * Parses the given parameter string and caches the result.
     * 
     * @param s the parameter string to parse
     * @return a Map made up of parameter names their values
     */
    private synchronized Map<String, String[]> parseParameters(String s)
    {
        Map<String, List<String>> parameterMap;
        Map<String, String[]> result;
        StringTokenizer st;

        parameterMap = new HashMap<String, List<String>>();
        result = new HashMap<String, String[]>();

        if (s == null)
        {
            return result;
        }

        st = new StringTokenizer(s, "&");
        while (st.hasMoreTokens())
        {
            String parameter;
            Matcher parameterMatcher;
            String name;
            String value;
            List<String> values;

            parameter = st.nextToken();
            parameterMatcher = PARAMETER_PATTERN.matcher(parameter);
            if (parameterMatcher.matches())
            {
                try
                {
                    name = URLDecoder.decode(parameterMatcher.group(1), "UTF-8");
                    value = URLDecoder.decode(parameterMatcher.group(2), "UTF-8");
                }
                catch (UnsupportedEncodingException e)
                {
                    logger.error("Unable to decode parameter '" + parameter + "'", e);
                    continue;
                }
            }
            else
            {
                try
                {
                    name = URLDecoder.decode(parameter, "UTF-8");
                    value = "";
                }
                catch (UnsupportedEncodingException e)
                {
                    logger.error("Unable to decode parameter '" + parameter + "'", e);
                    continue;
                }
            }

            if (parameterMap.get(name) == null)
            {
                values = new ArrayList<String>();
                values.add(value);
                parameterMap.put(name, values);
            }
            else
            {
                values = parameterMap.get(name);
                values.add(value);
            }
        }

        for (Map.Entry<String, List<String>> entry : parameterMap.entrySet())
        {
            String[] valueArray;

            valueArray = new String[entry.getValue().size()];
            result.put(entry.getKey(), entry.getValue().toArray(valueArray));
        }

        return result;
    }

    public synchronized String[] getArguments()
    {
        if (arguments != null)
        {
            return arguments.clone();
        }

        final Map<Integer, String> map = new HashMap<Integer, String>();
        int maxIndex = 0;
        for (Map.Entry<String, String> entry : request.entrySet())
        {
            if (! entry.getKey().startsWith("arg_"))
            {
                continue;
            }

            int index = Integer.valueOf(entry.getKey().substring(4));
            if (index > maxIndex)
            {
                maxIndex = index;
            }
            map.put(index, entry.getValue());
        }

        arguments = new String[maxIndex];
        for (int i = 0; i < maxIndex; i++)
        {
            arguments[i] = map.get(i + 1);
        }
        
        return arguments.clone();
    }

    public InetAddress getLocalAddress()
    {
        return localAddress;
    }

    void setLocalAddress(InetAddress localAddress)
    {
        this.localAddress = localAddress;
    }

    public int getLocalPort()
    {
        return localPort;
    }

    void setLocalPort(int localPort)
    {
        this.localPort = localPort;
    }

    public InetAddress getRemoteAddress()
    {
        return remoteAddress;
    }

    void setRemoteAddress(InetAddress remoteAddress)
    {
        this.remoteAddress = remoteAddress;
    }

    public int getRemotePort()
    {
        return remotePort;
    }

    void setRemotePort(int remotePort)
    {
        this.remotePort = remotePort;
    }

    @Override
   public String toString()
    {
        StringBuffer sb;

        sb = new StringBuffer("AgiRequest[");
        sb.append("script='").append(getScript()).append("',");
        sb.append("requestURL='").append(getRequestURL()).append("',");
        sb.append("channel='").append(getChannel()).append("',");
        sb.append("uniqueId='").append(getUniqueId()).append("',");
        sb.append("type='").append(getType()).append("',");
        sb.append("language='").append(getLanguage()).append("',");
        sb.append("callerIdNumber='").append(getCallerIdNumber()).append("',");
        sb.append("callerIdName='").append(getCallerIdName()).append("',");
        sb.append("dnid='").append(getDnid()).append("',");
        sb.append("rdnis='").append(getRdnis()).append("',");
        sb.append("context='").append(getContext()).append("',");
        sb.append("extension='").append(getExtension()).append("',");
        sb.append("priority='").append(getPriority()).append("',");
        sb.append("enhanced='").append(getEnhanced()).append("',");
        sb.append("accountCode='").append(getAccountCode()).append("',");
        sb.append("systemHashcode=").append(System.identityHashCode(this));
        sb.append("]");

        return sb.toString();
    }
}
