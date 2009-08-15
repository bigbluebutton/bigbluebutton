package org.asteriskjava.manager;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.asteriskjava.manager.event.ManagerEvent;
import org.asteriskjava.util.DaemonThreadFactory;

/**
 * Proxies a ManagerEventListener and dispatches events asynchronously by using
 * a single threaded executor.<p>
 * Use this proxy to prevent the reader thread from being blocked while your
 * application processes {@link org.asteriskjava.manager.event.ManagerEvent}s.
 * If you want to use the {@link org.asteriskjava.manager.ManagerConnection} for
 * sending actions in your {@link org.asteriskjava.manager.ManagerEventListener}
 * using a proxy like this one is mandatory; otherwise you will always run into
 * a timeout because the reader thread that is supposed to read the response to
 * your action is still blocked processing the event.<p>
 * If in doubt use the proxy as it won't hurt.<p>
 * Example:
 * <pre>
 * ManagerConnection connection;
 * ManagerEventListener myListener;
 * ...
 * connection.addEventListener(new ManagerEventListenerProxy(myListener));
 * </pre>
 * 
 * @author srt
 * @since 0.3
 * @version $Id: ManagerEventListenerProxy.java 938 2007-12-31 03:23:38Z srt $
 */
public class ManagerEventListenerProxy implements ManagerEventListener
{
    private final ExecutorService executor;
    private ManagerEventListener target;

    /**
     * Creates a new ManagerEventListenerProxy.<p>
     * You must set the target by calling {@link #setTarget(ManagerEventListener)}.
     */
    public ManagerEventListenerProxy()
    {
        this.executor = Executors.newSingleThreadExecutor(new DaemonThreadFactory());
    }

    /**
     * Creates a new ManagerEventListenerProxy that notifies the given target
     * asynchronously when new events are received.
     * 
     * @param target the target listener to invoke.
     */
    public ManagerEventListenerProxy(ManagerEventListener target)
    {
        this();
        this.target = target;
    }

    /**
     * Sets the target listener that is notified asynchronously when new events
     * are received.
     * c
     * @param target the target listener to invoke.
     */
    public synchronized void setTarget(ManagerEventListener target)
    {
        this.target = target;
    }

    public synchronized void onManagerEvent(final ManagerEvent event)
    {
        if (target != null)
        {
            executor.execute(new Runnable()
            {
                public void run()
                {
                    target.onManagerEvent(event);
                }
            });
        }
    }
    
    public void shutdown() {
        
        executor.shutdown();
    }
}
