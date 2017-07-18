package org.bigbluebutton.transcode.core.processmonitor;

public interface ProcessMonitorObserver {
    public void handleProcessFinishedUnsuccessfully(String processName, String processOutput);
    public void handleProcessFinishedWithSuccess(String processName, String processOutput);
}
