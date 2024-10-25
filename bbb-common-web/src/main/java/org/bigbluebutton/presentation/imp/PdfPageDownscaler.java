package org.bigbluebutton.presentation.imp;

import java.io.File;

public class PdfPageDownscaler {
    private static final String SPACE = " ";

    private long execTimeout = 10000;

    public boolean downscale(File source,File dest) {
        String COMMAND = "gs -sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH -dFirstPage=1 -dLastPage=1 -sOutputFile="
                + dest.getAbsolutePath() + SPACE
                + "/etc/bigbluebutton/nopdfmark.ps" + SPACE
                + source.getAbsolutePath();

        //System.out.println("DOWNSCALING " + COMMAND);

        return new ExternalProcessExecutor().exec(COMMAND, execTimeout);
    }

    public void setExecTimeout(long execTimeout) {
        this.execTimeout = execTimeout;
    }
}
