/*
 * Copyright 2010 david varnes.
 *
 * Licensed under the Apache License, version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at:
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.freeswitch.esl.client.transport.message;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.freeswitch.esl.client.transport.message.EslHeaders.Name;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Basic FreeSWITCH Event Socket messages from the server are decoded into this data object.
 * <p>
 * An ESL message is modelled as text lines.  A message always has one or more header lines, and 
 * optionally may have some body lines.
 * <p>
 * Header lines are parsed and cached in a map keyed by the {@link EslHeaders.Name} enum.  A message
 * is always expected to have a "Content-Type" header
 * <p>
 * Any Body lines are cached in a list.
 * 
 * @author  david varnes
 * @see EslHeaders.Name
 */
public class EslMessage
{
    private final Logger log = LoggerFactory.getLogger( this.getClass() );
    
    private final Map<Name,String> headers = new HashMap<Name,String>();
    private final List<String> body = new ArrayList<String>();
    
    private Integer contentLength = null;

    /**
     * All the received message headers in a map keyed by {@link EslHeaders.Name}. The string mapped value 
     * is the parsed content of the header line (ie, it does not include the header name).
     *  
     * @return map of header values
     */
    public Map<Name,String> getHeaders()
    {
        return headers;
    }

    /**
     * Convenience method
     * 
     * @param headerName as a {@link EslHeaders.Name}
     * @return true if an only if there is a header entry with the supplied header name 
     */
    public boolean hasHeader( Name headerName )
    {
        return headers.containsKey( headerName );
    }

    /**
     * Convenience method
     * 
     * @param headerName as a {@link EslHeaders.Name}
     * @return same as getHeaders().get( headerName )
     */
    public String getHeaderValue( Name headerName )
    {
        return headers.get( headerName );
    }
    
    /**
     * Convenience method
     * 
     * @return true if and only if a header exists with name "Content-Length" 
     */
    public boolean hasContentLength()
    {
        return headers.containsKey( Name.CONTENT_LENGTH );
    }
    
    /**
     * Convenience method
     * 
     * @return integer value of header with name "Content-Length"
     */
    public Integer getContentLength()
    {
        if ( contentLength != null )
        {
            return contentLength;
        }
        if ( hasContentLength() )
        {
            contentLength = Integer.valueOf( headers.get( Name.CONTENT_LENGTH) );
        }
        return contentLength;
    }
    
    /**
     * Convenience method
     * 
     * @return header value of header with name "Content-Type"
     */
    public String getContentType()
    {
        return headers.get( Name.CONTENT_TYPE );
    }

    /**
     * Any received message body lines
     * 
     * @return list with a string for each line received, may be an empty list
     */
    public List<String> getBodyLines()
    {
        return body;
    }
    
    /**
     * Used by the {@link EslMessageDecoder}.
     * 
     * @param name
     * @param value
     */
    void addHeader( Name name, String value )
    {
        log.debug( "adding header [{}] [{}]", name, value );
        headers.put( name, value );
    }
    
    /**
     * Used by the {@link EslMessageDecoder}
     * 
     * @param line
     */
    void addBodyLine( String line )
    {
        if ( line == null )
        {
            return;
        }
        body.add( line );
    }

    @Override
    public String toString()
    {
        StringBuilder sb = new StringBuilder( "EslMessage: contentType=[" );
        sb.append( getContentType() );
        sb.append( "] headers=" );
        sb.append( headers.size() );
        sb.append( ", body=" );
        sb.append( body.size() );
        sb.append( " lines." );
        
        return sb.toString();
    }
    
}
