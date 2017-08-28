package org.bigbluebutton.transcode.core.ffprobe;

import java.lang.Runtime;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.IOException;

public class FFProbeCommand {

  private String input;
  private String[] command;

    private String ffprobePath;
    private HashMap args;

    /* Analyze duration is a special parameter that MUST come before the input */
    private String analyzeDuration;

  public FFProbeCommand(String input) {
    this.input = input;
    this.command = null;
    this.ffprobePath = null;
    this.args = new HashMap();
  }

    public String[] getFFprobeCommand(boolean shouldBuild){
        if(shouldBuild)
            buildFFprobeCommand();

        return this.command;
    }

    public void buildFFprobeCommand() {
        List comm = new ArrayList<String>();

        if(this.ffprobePath == null)
            this.ffprobePath = "/usr/local/bin/ffprobe";

        comm.add(this.ffprobePath);

        /* Analyze duration MUST come before the input */
        if(analyzeDuration != null && !analyzeDuration.isEmpty()) {
            comm.add("-analyzeduration");
            comm.add(analyzeDuration);
        }

        comm.add("-i");
        comm.add(input);

        Iterator argsIter = this.args.entrySet().iterator();
        while (argsIter.hasNext()) {
            Map.Entry pairs = (Map.Entry)argsIter.next();
            comm.add(pairs.getKey());
            if (pairs.getValue()!=null)
                comm.add(pairs.getValue());
        }

        this.command = new String[comm.size()];
        comm.toArray(this.command);
    }

    public void setFFprobepath(String arg) {
        this.ffprobePath = arg;
    }

    public void setAnalyzeDuration(String duration) {
        this.analyzeDuration = duration;
    }

    public void setInput(String arg){
        this.input = arg;
    }

    public void setLoglevel(String arg){
        this.args.put("-loglevel", arg);
    }

    public void setShowStreams(){
        this.args.put("-show_streams",null);
    }

    public void selectStream(String arg){
        this.args.put("-select_streams", arg);
    }

}
