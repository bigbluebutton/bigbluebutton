package org.asteriskjava.manager.action;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Send a custom SIP notify message to the specified peer.<p>
 * All parameters for this event must be specified in the body of this request
 * via multiple variables. At least one variable pair must be specified.<p>
 * Available since Asterisk 1.6
 *
 * @author Laureano
 * @version $Id: SipNotifyAction.java 1152 2008-08-22 07:15:35Z srt $
 * @since 1.0.0
 */
public class SipNotifyAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = 0;

    private String channel;
    private Map<String, String> variables;

    /**
     * Creates a new SipNotifyAction.
     */
    public SipNotifyAction()
    {
        super();
    }

    /**
     * Creates a new SipNotifyAction that will be sent to the specified peer.
     *
     * @param channel the peer to send the notify to either "SIP/peer" or just "peer".
     */
    public SipNotifyAction(String channel)
    {
        super();
        this.channel = channel;
    }

    /**
     * Returns the name of this action, i.e. "SipNotify".
     */
    @Override
    public String getAction()
    {
        return "SipNotify";
    }

    /**
     * Sets the peer to receive the notify to.
     *
     * @param channel peer to receive the notify to either "SIP/peer" or just "peer".
     */
    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the peer that will receive the notify.
     *
     * @return peer
     */
    public String getChannel()
    {
        return channel;
    }

    /**
     * Returns the variables to set on the originated call.
     *
     * @return a Map containing the variable names as key and their
     *         values as value.
     * @since 1.0.0
     */
    public Map<String, String> getVariables()
    {
        return variables;
    }

    /**
     * Sets an variable on the originated call.
     *
     * @param name  the name of the variable to set.
     * @param value the value of the variable to set.
     * @since 1.0.0
     */
    public void setVariable(String name, String value)
    {
        if (variables == null)
        {
            variables = new LinkedHashMap<String, String>();
        }

        variables.put(name, value);
    }

    /**
     * Sets the variables to set on the originated call.
     *
     * @param variables a Map containing the variable names as key and their
     *                  values as value.
     * @since 1.0.0
     */
    public void setVariables(Map<String, String> variables)
    {
        this.variables = variables;
    }

}
