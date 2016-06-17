package org.bigbluebutton.app.video.ffmpeg;

public interface ProcessMonitorObserver {
        public void handleProcessFinishedUnsuccessfully(String processName, String processOutput);
            public void handleProcessFinishedWithSuccess(String processName, String processOutput);
}

