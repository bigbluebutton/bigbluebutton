package org.asteriskjava.manager.action;

import org.asteriskjava.manager.event.UserEvent;

/**
 * The UserEventAction will send a custom user event to the Asterisk server.
 * This is equivalent to using the <code>UserEvent</code> application in your
 * dial plan. Before you send this event, you <em>must</em> register your
 * event class with the registerUserEventClass method of the ManagerConnection.
 * 
 * @see org.asteriskjava.manager.event.UserEvent
 * @see org.asteriskjava.manager.ManagerConnection#registerUserEventClass(Class)
 * @author Martin
 */
public class UserEventAction extends AbstractManagerAction
{
    /**
     * Serial version identifier
     */
    private static final long serialVersionUID = 8696871424483458445L;

    /**
     * The event this action will send
     */
    private UserEvent userEvent;

    public UserEventAction()
    {
        super();
    }

    /**
     * Create the userevent action with userEvent as the event it will send
     * 
     * @param userEvent the subclass representing a custom event
     */
    public UserEventAction(UserEvent userEvent)
    {
        this.userEvent = userEvent;
    }

    /**
     * Get the name of this action
     */
    @Override
   public String getAction()
    {
        return "UserEvent";
    }

    /**
     * @return the userEvent
     */
    public UserEvent getUserEvent()
    {
        return userEvent;
    }

    /**
     * @param userEvent the userEvent to set
     * @see org.asteriskjava.manager.event.UserEvent
     */
    public void setUserEvent(UserEvent userEvent)
    {
        this.userEvent = userEvent;
    }
}
