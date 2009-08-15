package org.asteriskjava.manager.event;

/**
 * A ShowDialplanCompleteEvent is triggered for each priority in the dialplan
 * in response to a ShowDialplanAction.<p>
 * Available since Asterisk 1.6<p>
 * It is implemented in <code>main/pbx.c</code>
 *
 * @author srt
 * @version $Id: ListDialplanEvent.java 1164 2008-09-18 02:40:44Z sprior $
 * @see org.asteriskjava.manager.action.ShowDialplanAction
 * @see ShowDialplanCompleteEvent
 * @since 1.0.0
 */
public class ListDialplanEvent extends ResponseEvent
{
    private static final long serialVersionUID = 1L;

    private static final String PRIORITY_HINT = "hint";

    private String context;
    private String extension;
    private String extensionLabel;
    private Integer priority;
    private boolean hint = false;
    private String application;
    private String appData;
    private String registrar;

    public ListDialplanEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the context.
     *
     * @return the context.
     */
    public String getContext()
    {
        return context;
    }

    public void setContext(String context)
    {
        this.context = context;
    }

    /**
     * Returns the extension or extension pattern.
     *
     * @return the extension or extension pattern.
     */
    public String getExtension()
    {
        return extension;
    }

    public void setExtension(String extension)
    {
        this.extension = extension;
    }

    /**
     * Returns the extension label.
     * @return the extension label or <code>null</code> if none.
     */
    public String getExtensionLabel()
    {
        return extensionLabel;
    }

    public void setExtensionLabel(String extensionLabel)
    {
        this.extensionLabel = extensionLabel;
    }

    /**
     * Returns the priority.
     *
     * @return the priority or <code>null</code> if this is a hint.
     */
    public Integer getPriority()
    {
        return priority;
    }

    /**
     * Checks whether this is a hint.
     * @return <code>true</code> if this is a hint, <code>false</code> otherwise.
     */
    public boolean isHint()
    {
        return hint;
    }

    public void setPriority(String priorityString)
    {
        if (priorityString == null)
        {
            this.priority = null;
            return;
        }

        if (PRIORITY_HINT.equals(priorityString))
        {
            hint = true;
            this.priority = null;
        }
        else
        {
            this.priority = Integer.parseInt(priorityString);
        }
    }

    /**
     * Returns the application configured to handle this priority.
     *
     * @return the application configured to handle this priority.
     */
    public String getApplication()
    {
        return application;
    }

    public void setApplication(String application)
    {
        this.application = application;
    }

    /**
     * Returns the parameters of the application configured to handle this priority.
     *
     * @return the parameters of the application configured to handle this priority
     *         or <code>null</code> if none.
     */
    public String getAppData()
    {
        return appData;
    }

    public void setAppData(String appData)
    {
        this.appData = appData;
    }

    /**
     * Returns the registrar that registered this priority.<p>
     * Typical values are "features" for the parkedcalls context, "pbx_config" for priorities
     * defined in <code>extensions.conf</code> or "app_dial" for the 
     * app_dial_gosub_virtual_context context.
     *
     * @return the registrar that registered this priority.
     */
    public String getRegistrar()
    {
        return registrar;
    }

    public void setRegistrar(String registrar)
    {
        this.registrar = registrar;
    }
}