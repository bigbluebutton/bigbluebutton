package org.asteriskjava.manager.event;

import java.net.URLDecoder;
import java.io.UnsupportedEncodingException;
import java.util.*;

/**
 * 
 * The following sub events are reported:
 * <ul>
 * <li>Start: A channel has started the AGI("agi:async") application and is awaiting Async AGI commands.</li>
 * <li>Exec:  Execution of an AGI command initiated through {@link org.asteriskjava.manager.action.AgiAction}
 * has finished.</li>
 * <li>End:   A channel has left the AGI("agi:async") application.</li>
 * </ul>
 * It is implemented in <code>res/res_agi.c</code>.
 * <p/>
 * Available since Asterisk 1.6
 *
 * @author srt
 * @version $Id: AsyncAgiEvent.java 1169 2008-09-18 07:06:52Z srt $
 * @see org.asteriskjava.manager.action.AgiAction
 * @since 1.0.0
 */
public class AsyncAgiEvent extends ResponseEvent
{
    /**
     * Serializable version identifier.
     */
    static final long serialVersionUID = 0L;

    public static final String SUB_EVENT_START = "Start";
    public static final String SUB_EVENT_EXEC = "Exec";
    public static final String SUB_EVENT_END = "End";

    private String channel;
    private String subEvent;
    private String commandId;
    private String result;
    private String env;

    /**
     * Creates a new AsyncAgiEvent.
     *
     * @param source
     */
    public AsyncAgiEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the name of the channel this event occurred on.
     *
     * @return the name of the channel this event occurred on.
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Sets the name of the channel this event occurred on.
     *
     * @param channel the name of the channel this event occurred on.
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the sub event type. This is either "Start", "Exec" or "End".
     *
     * @return the sub event type.
     */
    public String getSubEvent()
    {
        return subEvent;
    }

    /**
     * Sets the sub event type.
     *
     * @param subEvent the sub event type.
     */
    public void setSubEvent(String subEvent)
    {
        this.subEvent = subEvent;
    }

    /**
     * Returns the command id of the corresponding {@link org.asteriskjava.manager.action.AgiAction}.<p>
     * This property is only available for the "Exec" sub event.
     *
     * @return the command id.
     * @see org.asteriskjava.manager.action.AgiAction#setCommandId(String)
     */
    public String getCommandId()
    {
        return commandId;
    }

    /**
     * Sets the command id.
     *
     * @param commandId the command id.
     */
    public void setCommandId(String commandId)
    {
        this.commandId = commandId;
    }

    /**
     * Returns the raw result of a command execution in response to the corresponding
     * {@link org.asteriskjava.manager.action.AgiAction}.<p>
     * This property is only available for the "Exec" sub event.<p>
     * The result is URL encoded and ends with a newline ("\n").<p>
     * Example:
     * <pre>
     * 200%20result%3d0
     * </pre>
     *
     * @return the URL encoded result.
     */
    public String getResult()
    {
        return result;
    }

    /**
     * Decodes the result.
     *
     * @return the decoded result.
     */
    public List<String> decodeResult()
    {
        return decode(getResult());
    }

    /**
     * Sets the raw result.
     *
     * @param result the URL encoded result.
     */
    public void setResult(String result)
    {
        this.result = result;
    }

    /**
     * Returns the raw AGI environment similar to the AGI request for FastAGI.<p>
     * This property is only available for the "Start" sub event.<p>
     * The environment is passed in multiple lines (separated by "\n"). Each line is URL encoded
     * and contains a key and a value. The environment ends with two newline characters ("\n\n").<p>
     * Example:
     * <pre>
     * ...
     * agi_channel%3a%20IAX2%2fpbx0-1
     * agi_language%3a%20de
     * agi_type%3a%20IAX2
     * agi_uniqueid%3a%201201838738.19
     * agi_version%3a%201.6.0-beta1
     * ...
     * </pre>
     *
     * @return the URL encoded AGI environment.
     */
    public String getEnv()
    {
        return env;
    }

    /**
     * Decodes the AGI environment and returns a list of lines.
     *
     * @return The decoded AGI environment or an empty list if the environment is not available (that is
     *         if {@link #getEnv()} returns <code>null</code>).
     * @see #getEnv()
     */
    public List<String> decodeEnv()
    {
        return decode(getEnv());
    }

    private List<String> decode(String s)
    {
        final List<String> result = new ArrayList<String>();

        if (s == null)
        {
            return result;
        }

        try
        {
            for (String line : s.split("\n"))
            {
                final String decodedLine = URLDecoder.decode(line, "ISO-8859-1");
                result.add(decodedLine);
            }
        }
        catch (UnsupportedEncodingException e)
        {
            // won't happen as JDK ships with ISO-8859-1
            throw new RuntimeException("This JDK does not support ISO-8859-1 encoding", e);
        }

        return result;
    }

    /**
     * Sets the AGI environment.
     *
     * @param env the URL encoded AGI environment.
     */
    public void setEnv(String env)
    {
        this.env = env;
    }

    /**
     * Checks is this a start sub event.
     *
     * @return <code>true</code> if this is a "Start" sub event, <code>false</code> otherwise.
     */
    public boolean isStart()
    {
        return isSubEvent(SUB_EVENT_START);
    }

    /**
     * Checks is this an exec sub event.
     *
     * @return <code>true</code> if this is an "Exec" sub event, <code>false</code> otherwise.
     */
    public boolean isExec()
    {
        return isSubEvent(SUB_EVENT_EXEC);
    }

    /**
     * Checks is this an end sub event.
     *
     * @return <code>true</code> if this is an "End" sub event, <code>false</code> otherwise.
     */
    public boolean isEnd()
    {
        return isSubEvent(SUB_EVENT_END);
    }

    protected boolean isSubEvent(String subEvent)
    {
        return this.subEvent != null && this.subEvent.equalsIgnoreCase(subEvent);
    }
}
