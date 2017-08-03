package org.bigbluebutton.transcode.core.processmonitor;

import java.io.InputStream;
import java.io.IOException;
import java.lang.reflect.Field;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.bigbluebutton.transcode.core.ffmpeg.FFmpegConstants;

public class ProcessMonitor {

    private String[] command;
    private Process process;
    private String name;
    ProcessStream inputStreamMonitor;
    ProcessStream errorStreamMonitor;
    private String inputStreamMonitorOutput;
    private String errorStreamMonitorOutput;
    public static enum Status{RUNNING,CLOSED_BY_USER};
    private Status status;

    private Thread thread;
    private ProcessMonitorObserver observer;

    public ProcessMonitor(String[] command,String name) {
        this.command = command;
        this.process = null;
        this.thread = null;
        this.inputStreamMonitor = null;
        this.errorStreamMonitor = null;
        this.name = name;
        this.inputStreamMonitorOutput = null;
        this.errorStreamMonitor = null;
    }

    @Override
    public String toString() {
        if (this.command == null || this.command.length == 0) {
            return "";
        }

        Pattern pattern = Pattern.compile("(.*) (.*)");
        StringBuffer result = new StringBuffer();
        String delim = "";
        for (String i : this.command) {
            Matcher matcher = pattern.matcher(i);
            if(matcher.matches()) {
                result.append(delim).append("\""+matcher.group(1)+" "+matcher.group(2)+"\"");
            }else result.append(delim).append(i);
            delim = " ";
        }
        return removeLogLevelFlag(result.toString());
    }

    private String getCommandString(){
        //used by the process's thread instead of toString()
        return this.toString();
    }

    public void setCommand(String[] command){
        this.command = command;
    }

    private void notifyProcessMonitorObserverOnFinishedUnsuccessfully() {
        if(observer != null){
            //log.debug("Notifying ProcessMonitorObserver that process finished unsuccessfully");
            observer.handleProcessFinishedUnsuccessfully(this.name,inputStreamMonitorOutput);
        }else {
            //log.debug("Cannot notify ProcessMonitorObserver that process finished unsuccessfully: ProcessMonitorObserver null");
        }
    }

    private void notifyProcessMonitorObserverOnFinished() {
        if(observer != null){
            //log.debug("Notifying ProcessMonitorObserver that {} successfully finished",this.name);
            observer.handleProcessFinishedWithSuccess(this.name,inputStreamMonitorOutput);
        }else {
            //log.debug("Cannot notify ProcessMonitorObserver that {} finished: ProcessMonitorObserver null",this.name);
        }
    }

	public synchronized void start() {
        if(this.thread == null){
            this.thread = new Thread( new Runnable(){
                public void run(){
                    try {
                        System.out.println("  > Creating thread to execute " + name);
                        process = Runtime.getRuntime().exec(command);
                        System.out.println("  > Executing " + name + "( pid=" + getPid() + " ):\n  " + getCommandString());

                        if(status == Status.CLOSED_BY_USER) {
                            System.out.println("  > ProcessMonitor closed by user. Closing " + name + " it immediatelly");
                            forceDestroy();
                            return;
                        }

                        InputStream is = process.getInputStream();
                        InputStream es = process.getErrorStream();

                        inputStreamMonitor = new ProcessStream(is,"STDOUT");
                        errorStreamMonitor = new ProcessStream(es,"STDERR");

                        inputStreamMonitor.start();
                        errorStreamMonitor.start();

                        process.waitFor();
                    }
                    catch(SecurityException se) {
                        System.out.println("Security Exception");
                    }
                    catch(IOException ioe) {
                        System.out.println("IO Exception");
                    }
                    catch(NullPointerException npe) {
                        System.out.println("NullPointer Exception");
                    }
                    catch(IllegalArgumentException iae) {
                        System.out.println("IllegalArgument Exception");
                    }
                    catch(InterruptedException ie) {
                        System.out.println("Interrupted Exception");
                    }

                    int ret = process.exitValue();

                    if (FFmpegConstants.acceptableExitCode(ret) || errorStreamMonitor.acceptableExitStatus()){
                        //log.debug("Exiting thread that executes {}. Exit value: {}, Exit status (from stdout): {} ",name,ret, errorStreamMonitor.getExitStatus());
                        storeProcessOutputs(inputStreamMonitor.getOutput(), errorStreamMonitor.getOutput());
                        clearData();
                        notifyProcessMonitorObserverOnFinished();
                    }
                    else{
                        //log.debug("Exiting thread that executes {}. Exit value: {}, Exit status (from stdout): {}",name,ret,errorStreamMonitor.getExitStatus());
                        storeProcessOutputs(inputStreamMonitor.getOutput(), errorStreamMonitor.getOutput());
                        clearData();
                        notifyProcessMonitorObserverOnFinishedUnsuccessfully();
                    }
                }
            });
            status = Status.RUNNING;
            this.thread.start();
        }else{
            //log.debug("Can't start a new process monitor: It is already running.");
        }
    }

    public synchronized void restart(){
        clearData();
        status = Status.CLOSED_BY_USER;
        start();
    }

    private void clearData(){
        closeProcessStream();
        closeProcess();
        clearMonitorThread();
    }

    private void clearMonitorThread(){
        if (this.thread !=null)
            this.thread=null;
    }

    private void closeProcessStream(){
        if(this.inputStreamMonitor != null){
            this.inputStreamMonitor.close();
            this.inputStreamMonitor = null;
        }
        if (this.errorStreamMonitor != null) {
            this.errorStreamMonitor.close();
            this.errorStreamMonitor = null;
        }
    }

    private void closeProcess(){
        if(this.process != null) {
            status = Status.CLOSED_BY_USER;
            //log.debug("Closing {} process",this.name);
            this.process.destroy();
            this.process = null;
        }
    }

    private void storeProcessOutputs(String inputStreamOutput,String errorStreamOutput){
        this.inputStreamMonitorOutput = inputStreamOutput;
        this.errorStreamMonitorOutput = errorStreamOutput;
    }

    public synchronized void destroy() {
        if (this.thread != null){
            status = Status.CLOSED_BY_USER;
            clearData();
            //log.debug("ProcessMonitor successfully finished");
        }else{
            //log.debug("Can't destroy this process monitor: There's no process running.");
        }
    }

    public void setProcessMonitorObserver(ProcessMonitorObserver observer){
        if (observer==null){
            //log.debug("Cannot assign observer: ProcessMonitorObserver null");
        }else this.observer = observer;
    }

    public int getPid(){
        Field f;
        int pid;
        try {
            if (this.process == null) return -1;
            f = this.process.getClass().getDeclaredField("pid");
            f.setAccessible(true);
            pid = (int)f.get(this.process);
            return pid;
        } catch (IllegalArgumentException | IllegalAccessException
                | NoSuchFieldException | SecurityException e) {
            //log.debug("Error when obtaining {} PID",this.name);
            return -1;
        }
    }

    public synchronized void forceDestroy(){
        if (this.thread != null) {
            status = Status.CLOSED_BY_USER;
        try {
            int pid = getPid();
            if (pid < 0){
                //log.debug("Process doesn't exist. Not destroying it...");
                return;
            }else {
                Runtime.getRuntime().exec("kill -9 "+ getPid());
            }
        } catch (IOException e) {
            //log.debug("Failed to force-kill {} process",this.name);
            e.printStackTrace();
        }
        }else{
            //log.debug("Can't force-destroy this process monitor: There's no process running.");
        }
    }

    public boolean isFFmpegProcess(){
        return this.name.toLowerCase().contains("ffmpeg");
    }

    /**
     * Removes loglevel flag of ffmpeg command.
     * Usefull for faster debugging
     */
    private String removeLogLevelFlag(String commandString){
        if (isFFmpegProcess()){
            return commandString.replaceAll("-loglevel \\w+", "");
        }else return commandString;
    }

}
