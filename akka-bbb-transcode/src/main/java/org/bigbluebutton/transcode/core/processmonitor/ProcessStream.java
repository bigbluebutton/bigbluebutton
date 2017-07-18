package org.bigbluebutton.transcode.core.processmonitor;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

import java.io.IOException;
import org.bigbluebutton.transcode.core.ffmpeg.FFmpegConstants;

public class ProcessStream {
    private InputStream stream;
    private Thread thread;
    private String type;
    private String output;
    private int exitStatus = FFmpegConstants.RUNNING_STATUS;

    ProcessStream(InputStream stream, String type) {
        if(stream != null)
            this.stream = stream;
            this.type = type;
            this.output = "";
    }

    protected void start() {
        exitStatus = FFmpegConstants.RUNNING_STATUS;
        this.thread = new Thread( new Runnable(){
            public void run(){
                try {
                    String line;
                    InputStreamReader isr = new InputStreamReader(stream);
                    BufferedReader ibr = new BufferedReader(isr);
                    output = "";
                    while ((line = ibr.readLine()) != null) {
                        ////log.debug("[{}]"+line,type);
                        updateCurrentStatusFromOutput(line);
                        output+=line+"\n";
                    }

                    close();
                }
                catch(IOException ioe) {
                    //log.debug("Finishing process stream [type={}] because there's no more data to be read",type);
                    close();
                }
            }
        });
        this.thread.start();
    }

    protected void close() {
        try {
            if(this.stream != null) {
                ////log.debug("Closing process stream");
                this.stream.close();
                this.stream = null;
            }
        }
        catch(IOException ioe) {
            //log.debug("IOException");
        }
    }

    protected String getOutput(){
        return this.output;
    }

    /**
     * Update current process status based on the stdout.
     * The exitStatus is mapped according to ffmpeg exit status
     * @param outputLine
     * Requires loglevel verbose of FFmpegCommand
     */
    private void updateCurrentStatusFromOutput(String outputLine){
        if (outputLine != null){
            if (outputLine.contains(FFmpegConstants.FFMPEG_EXIT_WITH_NO_INPUT_OUTPUT)){
                ////log.debug("FFmpeg exited with no input status.");
                exitStatus = FFmpegConstants.EXIT_WITH_NO_INPUT_STATUS;
            }
            /*else if outputLine.contains(FFmpegConstants....)
                exitStatus = FFmpegConstants....
             */
        }
    }

    public int getExitStatus(){
        return exitStatus;
    }

    /**
     * Validates exit status
     */
    public boolean acceptableExitStatus(){
        return FFmpegConstants.acceptableExitStatus(exitStatus);
    }
}
