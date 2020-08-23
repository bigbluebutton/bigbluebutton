package org.bigbluebutton.app.video.ffmpeg;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import java.lang.reflect.Field;

import java.io.IOException;

public class ProcessMonitor implements Runnable {
    private static Logger log = Red5LoggerFactory.getLogger(ProcessMonitor.class, "video");

    private String[] command;
    private Process process;

    ProcessStream inputStreamMonitor;
    ProcessStream errorStreamMonitor;

    private Thread thread = null;
    private ProcessMonitorObserver observer;
    private String name;
    private Boolean alive;

    public ProcessMonitor(String[] command, String name) {
        this.command = command;
        this.process = null;
        this.inputStreamMonitor = null;
        this.errorStreamMonitor = null;
        this.name = name;
        this.alive = false;
    }

    public String toString() {
        if (this.command == null || this.command.length == 0) {
            return "";
        }
        return String.join("", this.command);
    }

    public void run() {
        try {
            log.debug("Creating thread to execute FFmpeg");
            this.process = Runtime.getRuntime().exec(this.command);
            log.debug("Executing [pid={}]: " + this.toString(),getPid());

            if(this.process == null) {
                log.debug("process is null");
                return;
            }

            if (!this.alive) {
                log.debug("Process status was changed to 'not alive' between it's triggering and system execution. Killing it...");
                this.forceDestroy();
                return;
            }
            inputStreamMonitor = new ProcessStream(this.process.getInputStream());
            errorStreamMonitor = new ProcessStream(this.process.getErrorStream());

            inputStreamMonitor.start();
            errorStreamMonitor.start();

            this.process.waitFor();

            int ret = this.process.exitValue();
            log.debug("Exit value: " + ret);

            destroy();
        } catch (Exception failure) {
            log.debug(failure.getClass().getSimpleName());
        }

        log.debug("Exiting thread that executes FFmpeg");
        notifyProcessMonitorObserverOnFinished();
    }

    public synchronized void start() {
        if (this.thread == null) {
            this.thread = new Thread(this);
            this.alive = true;
            this.thread.start();
        } else {
            log.debug("Can't start a new process monitor: It is already running.");
        }
    }

    public void destroy() {
        if(this.inputStreamMonitor != null && this.errorStreamMonitor != null) {
            this.inputStreamMonitor.close();
            this.errorStreamMonitor.close();
        }

        if(this.process != null) {
            log.debug("Closing FFmpeg process");
            this.process.destroy();
            this.process = null;
        }
    }

    public int getPid() {
        Field f;
        int pid;
        if (this.process == null) return -1;
        try {
           f = this.process.getClass().getDeclaredField("pid");
           f.setAccessible(true);
           pid = (int)f.get(this.process);
           return pid;
        } catch (IllegalArgumentException | IllegalAccessException | NoSuchFieldException | SecurityException e) {
           log.debug("Error when obtaining {} PID",this.name);
           return -1;
        }
    }

    public synchronized void forceDestroy(){
        if (this.thread != null) {
            try {
               this.alive = false;
               int pid = getPid();

               if (pid < 0)
                   log.debug("Process doesn't exist. Not destroying it...");
               else
                   Runtime.getRuntime().exec("kill -9 "+ pid);
            } catch (IOException e) {
               log.debug("Failed to force-kill {} process",this.name);
               e.printStackTrace();
            }
        } else
           log.debug("Can't force-destroy this process monitor: There's no process running.");
    }

    private void notifyProcessMonitorObserverOnFinished() {
        if (observer != null) {
            log.debug("Notifying ProcessMonitorObserver that {} successfully finished",this.name);
            observer.handleProcessFinishedWithSuccess(this.name,"");
            return;
        }
        log.debug("Cannot notify ProcessMonitorObserver that {} finished: ProcessMonitorObserver null",this.name);
    }

    public void setProcessMonitorObserver(ProcessMonitorObserver observer){
        if (observer == null) {
            log.debug("Cannot assign observer: ProcessMonitorObserver null");
            return;
        }
        this.observer = observer;
    }

}
