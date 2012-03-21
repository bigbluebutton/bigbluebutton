package org.bigbluebutton.presentation.imp;

import java.util.Timer;
import java.util.TimerTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A wrapper class the executes an external command. 
 * 
 * See http://kylecartmell.com/?p=9
 * 
 * @author Richard Alam
 *
 */
public class ExternalProcessExecutor {
	private static Logger log = LoggerFactory.getLogger(ExternalProcessExecutor.class);
	
	public boolean exec(String COMMAND, long timeoutMillis) {
        Timer timer = null;
        Process p = null;
        try {
            timer = new Timer(true);
            InterruptTimerTask interrupter = new InterruptTimerTask(Thread.currentThread());
            timer.schedule(interrupter, timeoutMillis);
            p = Runtime.getRuntime().exec(COMMAND);
            p.waitFor();
            return true;
        } catch(Exception e) {
        	log.info("TIMEDOUT excuting : " + COMMAND);
            p.destroy();
        } finally {
            timer.cancel();     // If the process returns within the timeout period, we have to stop the interrupter
                                // so that it does not unexpectedly interrupt some other code later.

            Thread.interrupted();   // We need to clear the interrupt flag on the current thread just in case
                                    // interrupter executed after waitFor had already returned but before timer.cancel
                                    // took effect.
                                    //
                                    // Oh, and there's also Sun bug 6420270 to worry about here.
        }  
		return false;
	}
	

	class InterruptTimerTask extends TimerTask {
	    private Thread thread;

	    public InterruptTimerTask(Thread t) {
	        this.thread = t;
	    }

	    public void run() {
	        thread.interrupt();
	    }

	}
}
