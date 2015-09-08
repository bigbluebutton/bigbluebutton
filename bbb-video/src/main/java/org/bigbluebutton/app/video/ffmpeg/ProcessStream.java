package org.bigbluebutton.app.video.ffmpeg;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

import java.io.IOException;

public class ProcessStream implements Runnable {
    private static Logger log = Red5LoggerFactory.getLogger(ProcessStream.class, "video");
    private InputStream stream;
    private Thread thread;

    ProcessStream(InputStream stream) {
        if(stream != null)
            this.stream = stream;
    }

    public void run() {
        try {
            log.debug("Creating thread to execute the process stream");
            String line;
            InputStreamReader isr = new InputStreamReader(this.stream);
            BufferedReader ibr = new BufferedReader(isr);
            while ((line = ibr.readLine()) != null) {
                //log.debug(line);
            }

            close();
        }
        catch(IOException ioe) {
            log.debug("IOException");
            close();
        }

        log.debug("Exiting thread that handles process stream");
    }

    public void start() {
        this.thread = new Thread(this);
        this.thread.start();
    }

    public void close() {
        try {
            if(this.stream != null) {
                log.debug("Closing process stream");
                this.stream.close();
                this.stream = null;
            }
        }
        catch(IOException ioe) {
            log.debug("IOException");
        }
    }
}