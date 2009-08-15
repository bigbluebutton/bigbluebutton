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
package org.asteriskjava.fastagi;

import java.net.InetAddress;
import java.util.Map;

/**
 * Provides client request information to an {@link org.asteriskjava.fastagi.AgiScript}.<p>
 * This includes information about the channel the script is invoked on and
 * parameters passed from the dialplan.
 * 
 * @author srt
 * @version $Id: AgiRequest.java 1286 2009-04-04 09:40:40Z srt $
 */
public interface AgiRequest
{
    /**
     * Returns a Map containing the raw request name/value pairs.
     * 
     * @return Map contain raw request name/value pairs.
     */
    Map getRequest();

    /**
     * Returns the name of the script to execute including its full path.<p>
     * This corresponds to the request url with protocol, host, port and
     * parameters stripped off.<p>
     * As Async AGI does not yet pass a script parameter this property will
     * be <code>null</code> for requests received through Async AGI.
     * 
     * @return the name of the script to execute.
     */
    String getScript();

    /**
     * Returns the full URL of the requestURL in the form
     * agi://host[:port][/script][?param1=value1&param2=value2].
     * 
     * @return the full URL of the requestURL in the form
     *         agi://host[:port][/script][?param1=value1&param2=value2].
     */
    String getRequestURL();

    /**
     * Returns the name of the channel.
     * 
     * @return the name of the channel.
     */
    String getChannel();

    /**
     * Returns the unqiue id of the channel.
     * 
     * @return the unqiue id of the channel.
     */
    String getUniqueId();

    /**
     * Returns the type of the channel, for example "SIP".
     * 
     * @return the type of the channel, for example "SIP".
     */
    String getType();

    /**
     * Returns the language set for the current channel, for example "en".
     * 
     * @return the language set for the current channel, for example "en".
     */
    String getLanguage();

    /**
     * Returns the Caller*ID number, for example "1234".<p>
     * Note: even with Asterisk 1.0 is contains only the numerical part
     * of the Caller ID.
     * 
     * @return the Caller*ID number, for example "1234", if no Caller*ID is set or it
     *         is "unknown" <code>null</code> is returned.
     * @deprecated as of 0.3, use {@link #getCallerIdNumber()} instead.
     */
    String getCallerId();

    /**
     * Returns the Caller*ID number, for example "1234".<p>
     * Note: even with Asterisk 1.0 is contains only the numerical part
     * of the Caller ID.
     * 
     * @return the Caller*ID number, for example "1234", if no Caller*ID is set or it
     *         is "unknown" <code>null</code> is returned.
     */
    String getCallerIdNumber();

    /**
     * Returns the the Caller*ID Name, for example "John Doe".
     * 
     * @return the the Caller*ID Name, for example "John Doe", if no Caller*ID
     *         Name is set or it is "unknown" <code>null</code> is returned.
     */
    String getCallerIdName();

    /**
     * Returns the number, that has been dialed by the user.
     * 
     * @return the dialed number, if no DNID is available or it is "unknown"
     *         <code>null</code> is returned.
     */
    String getDnid();

    /**
     * If this call has been forwared, the number of the person doing the
     * redirect is returned (Redirected dialed number identification service).<p>
     * This is usally only only available on PRI.
     * 
     * @return the number of the person doing the redirect, , if no RDNIS is
     *         available or it is "unknown" <code>null</code> is returned.
     */
    String getRdnis();

    /**
     * Returns the context in the dial plan from which the AGI script was
     * called.
     * 
     * @return the context in the dial plan from which the AGI script was
     *         called.
     */
    String getContext();

    /**
     * Returns the extension in the dial plan from which the AGI script was
     * called.
     * 
     * @return the extension in the dial plan from which the AGI script was
     *         called.
     */
    String getExtension();

    /**
     * Returns the priority of the dial plan entry the AGI script was
     * called from.
     * 
     * @return the priority of the dial plan entry the AGI script was
     *         called from.
     */
    Integer getPriority();

    /**
     * Returns wheather this agi is passed audio (EAGI - Enhanced AGI).<p>
     * Enhanced AGI is currently not supported on FastAGI.
     * 
     * @return Boolean.TRUE if this agi is passed audio, Boolean.FALSE
     *         otherwise.
     */
    Boolean getEnhanced();

    /**
     * Returns the account code set for the call.
     * 
     * @return the account code set for the call.
     */
    String getAccountCode();

    /**
     * Returns the Callerid presentation/screening.<p>
     * Available since Asterisk 1.2.
     * 
     * @return the Callerid presentation/screening.
     * @since 0.2
     */
    Integer getCallingPres();

    /**
     * Returns the Callerid ANI 2 (Info digits).<p>
     * Available since Asterisk 1.2.
     * 
     * @return the Callerid ANI 2 (Info digits).
     * @since 0.2
     */
    Integer getCallingAni2();

    /**
     * Returns the Callerid Type of Number.<p>
     * Available since Asterisk 1.2.
     * 
     * @return the Callerid Type of Number.
     * @since 0.2
     */
    Integer getCallingTon();

    /**
     * Returns the Callerid Transit Network Select.<p>
     * Available since Asterisk 1.2.
     * 
     * @return the Callerid Transit Network Select.
     * @since 0.2
     */
    Integer getCallingTns();

    /**
     * Returns the value of a request parameter as a String, or
     * <code>null</code> if the parameter does not exist. You should only use
     * this method when you are sure the parameter has only one value.<p>
     * If the parameter might have more than one value, use
     * {@link #getParameterValues(String)}.<p>
     * If you use this method with a multivalued parameter, the value returned
     * is equal to the first value in the array returned by
     * <code>getParameterValues</code>.
     * 
     * @param name a String containing the name of the parameter whose value is
     *            requested.
     * @return a String representing the single value of the parameter.
     * @see #getParameterValues(String)
     */
    String getParameter(String name);

    /**
     * Returns an array of String objects containing all of the values the given
     * request parameter has, or
     * an empty array if the parameter does not exist.<p>
     * If the parameter has a single value, the array has a length of 1.
     * 
     * @param name a String containing the name of the parameter whose value is requested.
     * @return an array of String objects containing the parameter's values.
     */
    String[] getParameterValues(String name);

    /**
     * Returns a Map of the parameters of this request.
     * 
     * @return a java.util.Map containing parameter names as keys and parameter
     *         values as map values. The keys in the parameter map are of type
     *         String. The values in the parameter map are of type String array.
     */
    Map<String, String[]> getParameterMap();

    /**
     * Returns the array of arguments passed from the AGI dialplan command.<p>
     * Example: {@code AGI(agi://localhost/HelloWorld,value1,,value2)} results in
     * {@code getArguments()[0] = "value1"}, {@code getArguments()[1] = null}
     * and {@code getArguments()[2] = "value2"}.<p>
     * Available since Asterisk 1.6
     *
     * @return the array of arguments passed from the AGI command, never <code>null</code>.
     * @since 1.0.0
     */
    String[] getArguments();

    /**
     * Returns the local address this channel, that is the IP address of the AGI
     * server.
     * 
     * @return the local address this channel.
     * @since 0.2
     */
    InetAddress getLocalAddress();

    /**
     * Returns the local port of this channel, that is the port the AGI server
     * is listening on.
     * 
     * @return the local port of this socket channel.
     * @since 0.2
     */
    int getLocalPort();

    /**
     * Returns the remote address of this channel, that is the IP address of the
     * Asterisk server.
     * 
     * @return the remote address of this channel.
     * @since 0.2
     */
    InetAddress getRemoteAddress();

    /**
     * Returns the remote port of this channel, that is the client port the
     * Asterisk server is using for the AGI connection.
     * 
     * @return the remote port of this channel.
     * @since 0.2
     */
    int getRemotePort();
}
