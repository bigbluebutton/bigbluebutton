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
package org.freeswitch.esl.client.transport.event;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.freeswitch.esl.client.internal.HeaderParser;
import org.freeswitch.esl.client.transport.message.EslHeaders;
import org.freeswitch.esl.client.transport.message.EslMessage;
import org.freeswitch.esl.client.transport.message.EslHeaders.Name;
import org.freeswitch.esl.client.transport.message.EslHeaders.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * FreeSWITCH Event Socket <strong>events</strong> are decoded into this data object.
 * <p>
 * An ESL event is modelled as a collection of text lines. An event always has several eventHeader
 * lines, and optionally may have some eventBody lines.  In addition the messageHeaders of the 
 * original containing {@link EslMessage} which carried the event are also available. 
 * <p>
 * The eventHeader lines are parsed and cached in a map keyed by the eventHeader name string. An event
 * is always expected to have an "Event-Name" eventHeader. Commonly used eventHeader names are coded
 * in {@link EslEventHeaderNames}
 * <p>
 * Any eventBody lines are cached in a list.
 * <p>
 * The messageHeader lines from the original message are cached in a map keyed by {@link EslHeaders.Name}.
 * 
 * @author  david varnes
 * @see EslEventHeaderNames
 */
public class EslEvent 
{
    private final Logger log = LoggerFactory.getLogger( this.getClass() );
    
    private final Map<Name,String> messageHeaders;
    private final Map<String,String> eventHeaders;
    private final List<String> eventBody;
    private boolean decodeEventHeaders = true;
    
    public EslEvent( EslMessage rawMessage )
    {
        this( rawMessage, false );
    }
    
    public EslEvent( EslMessage rawMessage, boolean parseCommandReply )
    {
        messageHeaders = rawMessage.getHeaders();
        eventHeaders = new HashMap<String,String>( rawMessage.getBodyLines().size() );
        eventBody = new ArrayList<String>();
        // plain or xml body
        if ( rawMessage.getContentType().equals( Value.TEXT_EVENT_PLAIN ) )
        {
            parsePlainBody( rawMessage.getBodyLines() );
        }
        else if ( rawMessage.getContentType().equals( Value.TEXT_EVENT_XML ) )
        {
            throw new IllegalStateException( "XML events are not yet supported" );
        }
        else if ( rawMessage.getContentType().equals( Value.COMMAND_REPLY ) && parseCommandReply )
        {
            parsePlainBody( rawMessage.getBodyLines() );
        }
        else
        {
            throw new IllegalStateException( "Unexpected EVENT content-type: " + 
                rawMessage.getContentType() );
        }
    }

    /**
     * The message headers of the original ESL message from which this event was decoded.
     * The message headers are stored in a map keyed by {@link EslHeaders.Name}. The string mapped value 
     * is the parsed content of the header line (ie, it does not include the header name).
     *  
     * @return map of header values
     */
    public Map<Name,String> getMessageHeaders()
    {
        return messageHeaders;
    }

    /**
     * The event headers of this event. The headers are parsed and stored in a map keyed by the string 
     * name of the header, and the string mapped value is the parsed content of the event header line 
     * (ie, it does not include the header name).
     *  
     * @return map of event header values
     */
    public Map<String, String> getEventHeaders()
    {
        return eventHeaders;
    }
    
    /**
     * Any event body lines that were present in the event.
     * 
     * @return list of decoded event body lines, may be an empty list.
     */
    public List<String> getEventBodyLines()
    {
        return eventBody;
    }
    
    /**
     * Convenience method.
     * 
     * @return the string value of the event header "Event-Name"
     */
    public String getEventName()
    {
        return getEventHeaders().get( EslEventHeaderNames.EVENT_NAME ); 
    }
    
    /**
     * Convenience method.
     *
     * @return the string value of the event header "Event-Subclass"
     */
    public String getEventSubclass()
    {
        String subClass = getEventHeaders().get( EslEventHeaderNames.EVENT_SUBCLASS );
        if(subClass == null){
            return "NONE";
        }
        return subClass;
    }

    /**
     * Convenience method.
     * 
     * @return long value of the event header "Event-Date-Timestamp"
     */
    public long getEventDateTimestamp()
    {
        return Long.valueOf( getEventHeaders().get( EslEventHeaderNames.EVENT_DATE_TIMESTAMP ) );
    }

    /**
     * Convenience method.
     * 
     * @return long value of the event header "Event-Date-Local"
     */
    public String getEventDateLocal()
    {
        return getEventHeaders().get( EslEventHeaderNames.EVENT_DATE_LOCAL );
    }

    /**
     * Convenience method.
     * 
     * @return long value of the event header "Event-Date-GMT"
     */
    public String getEventDateGmt()
    {
        return getEventHeaders().get( EslEventHeaderNames.EVENT_DATE_GMT );
    }

    /**
     * Convenience method.
     * 
     * @return true if the eventBody list is not empty.
     */
    public boolean hasEventBody()
    {
        return ! eventBody.isEmpty();
    }
    
    private void parsePlainBody( final List<String> rawBodyLines )
    {
        boolean isEventBody = false;
        for ( String rawLine : rawBodyLines )
        {
            if ( ! isEventBody )
            {
                // split the line
                String[] headerParts = HeaderParser.splitHeader( rawLine );
                if ( decodeEventHeaders )
                {
                    try
                    {
                        String decodedValue = URLDecoder.decode( headerParts[1], "UTF-8" );
                        log.trace( "decoded from: [{}]", headerParts[1] );
                        log.trace( "decoded   to: [{}]", decodedValue );
                        eventHeaders.put( headerParts[0], decodedValue );
                    }
                    catch ( UnsupportedEncodingException e )
                    {
                        log.warn( "Could not URL decode [{}]", headerParts[1] );
                        eventHeaders.put( headerParts[0], headerParts[1] );
                    }
                }
                else
                {
                    eventHeaders.put( headerParts[0], headerParts[1] );
                }
                if ( headerParts[0].equals( EslEventHeaderNames.CONTENT_LENGTH ) )
                {
                    // the remaining lines will be considered body lines
                    isEventBody = true;
                }
            }
            else
            {
                // ignore blank line (always is one following the content-length
                if ( rawLine.length() > 0 )
                {
                    eventBody.add( rawLine );
                }
            }
        }

    }
    
    @Override
    public String toString()
    {
        StringBuilder sb = new StringBuilder( "EslEvent: name=[" );
        sb.append( getEventName() );
        sb.append( "] subclass=[");
        sb.append( getEventSubclass() );
        sb.append( "] headers=" );
        sb.append( messageHeaders.size() );
        sb.append( ", eventHeaders=" );
        sb.append( eventHeaders.size() );
        sb.append( ", eventBody=" );
        sb.append( eventBody.size() );
        sb.append( " lines." );
        
        return sb.toString();
    }
}
