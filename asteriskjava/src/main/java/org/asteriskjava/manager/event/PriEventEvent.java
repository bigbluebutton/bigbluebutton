package org.asteriskjava.manager.event;

/**
 * This event is implemented in <code>channels/chan_dahdi.c</code>.<p>
 * Available since Asterisk 1.6.1
 *
 * @author srt
 * @version $Id: PriEventEvent.java 1230 2009-02-06 02:32:40Z sprior $
 * @since 1.0.0
 */
public class PriEventEvent extends ManagerEvent
{
   private static final long serialVersionUID = 3257069450639290810L;
   private String priEvent;
    private Integer priEventCode;
    private String dChannel;
    private Integer span;

    public PriEventEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the textual representation of the event code.<p>
     * This is one of
     * <ul>
     * <li>"On hook"
     * <li>"Ring/Answered"
     * <li>"Wink/Flash"
     * <li>"Alarm"
     * <li>"No more alarm"
     * <li>"HDLC Abort"
     * <li>"HDLC Overrun"
     * <li>"HDLC Bad FCS"
     * <li>"Dial Complete"
     * <li>"Ringer On"
     * <li>"Ringer Off"
     * <li>"Hook Transition Complete"
     * <li>"Bits Changed"
     * <li>"Pulse Start"
     * <li>"Timer Expired"
     * <li>"Timer Ping"
     * <li>"Polarity Reversal"
     * <li>"Ring Begin"
     * </ul>
     *
     * @return the textual representation of the event code.
     * @see #getPriEventCode()
     */
    public String getPriEvent()
    {
        return priEvent;
    }

    public void setPriEvent(String priEvent)
    {
        this.priEvent = priEvent;
    }

    /**
     * Returns the numerical pri event code.
     *
     * @return the numerical pri event code.
     * @see #getPriEvent()
     */
    public Integer getPriEventCode()
    {
        return priEventCode;
    }

    public void setPriEventCode(Integer priEventCode)
    {
        this.priEventCode = priEventCode;
    }

    /**
     * Returns the D-Channel the event occurred on.
     *
     * @return the D-Channel the event occurred on.
     */
    public String getDChannel()
    {
        return dChannel;
    }

    public void setDChannel(String dChannel)
    {
        this.dChannel = dChannel;
    }

    /**
     * Returns the span the event occurred on.
     *
     * @return the span the event occurred on.
     */
    public Integer getSpan()
    {
        return span;
    }

    public void setSpan(Integer span)
    {
        this.span = span;
    }
}
