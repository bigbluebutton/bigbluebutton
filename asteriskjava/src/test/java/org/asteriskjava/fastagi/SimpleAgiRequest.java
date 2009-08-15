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
package org.asteriskjava.fastagi;

import java.net.InetAddress;
import java.util.Map;

public class SimpleAgiRequest implements AgiRequest
{
    InetAddress localAddress;
    int localPort;
    InetAddress remoteAddress;
    int remotePort;
    private String script;

    public SimpleAgiRequest()
    {
        this.script = "hello.agi";
    }
    
    public SimpleAgiRequest(String script)
    {
        this.script = script;
    }
    
    public Map getRequest()
    {
        throw new UnsupportedOperationException();
    }

    public String getScript()
    {
        return script;
    }

    public String getRequestURL()
    {
        throw new UnsupportedOperationException();
    }

    public String getChannel()
    {
        throw new UnsupportedOperationException();
    }

    public String getUniqueId()
    {
        throw new UnsupportedOperationException();
    }

    public String getType()
    {
        throw new UnsupportedOperationException();
    }

    public String getLanguage()
    {
        throw new UnsupportedOperationException();
    }

    /**
     * Returns the Caller*ID number, for example "1234".<p>
     * Note: even with Asterisk 1.0 is contains only the numerical part
     * of the Caller ID.
     *
     * @return the Caller*ID number, for example "1234", if no Caller*ID is set or it
     *         is "unknown" <code>null</code> is returned.
     * @deprecated as of 0.3, use {@link #getCallerIdNumber()} instead.
     */
    public String getCallerId()
    {
        throw new UnsupportedOperationException();
    }

    public String getCallerIdNumber()
    {
        throw new UnsupportedOperationException();
    }

    public String getCallerIdName()
    {
        throw new UnsupportedOperationException();
    }

    public String getDnid()
    {
        throw new UnsupportedOperationException();
    }

    public String getRdnis()
    {
        throw new UnsupportedOperationException();
    }

    public String getContext()
    {
        throw new UnsupportedOperationException();
    }

    public String getExtension()
    {
        throw new UnsupportedOperationException();
    }

    public Integer getPriority()
    {
        throw new UnsupportedOperationException();
    }

    public Boolean getEnhanced()
    {
        throw new UnsupportedOperationException();
    }

    public String getAccountCode()
    {
        throw new UnsupportedOperationException();
    }

    public Integer getCallingAni2()
    {
        throw new UnsupportedOperationException();
    }

    public Integer getCallingPres()
    {
        throw new UnsupportedOperationException();
    }

    public Integer getCallingTns()
    {
        throw new UnsupportedOperationException();
    }

    public Integer getCallingTon()
    {
        throw new UnsupportedOperationException();
    }

    public String getParameter(String name)
    {
        throw new UnsupportedOperationException();
    }

    public String[] getParameterValues(String name)
    {
        throw new UnsupportedOperationException();
    }

    public Map<String, String[]> getParameterMap()
    {
        throw new UnsupportedOperationException();
    }

    public String[] getArguments()
    {
        throw new UnsupportedOperationException();
    }

    public InetAddress getLocalAddress()
    {
        return localAddress;
    }

    public void setLocalAddress(InetAddress localAddress)
    {
        this.localAddress = localAddress;
    }

    public int getLocalPort()
    {
        return localPort;
    }

    public void setLocalPort(int localPort)
    {
        this.localPort = localPort;
    }

    public InetAddress getRemoteAddress()
    {
        return remoteAddress;
    }

    public void setRemoteAddress(InetAddress remoteAddress)
    {
        this.remoteAddress = remoteAddress;
    }

    public int getRemotePort()
    {
        return remotePort;
    }

    public void setRemotePort(int remotePort)
    {
        this.remotePort = remotePort;
    }
}