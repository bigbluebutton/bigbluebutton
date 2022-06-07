package org.bigbluebutton.presentation.imp;

import java.io.File;

public class PdfPageDownscaler {
    private static final String SPACE = " ";

    public boolean downscale(File source,File dest) {
        String COMMAND = "gs -sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH -dFirstPage=1 -dLastPage=1 -sOutputFile="
                + dest.getAbsolutePath() + SPACE
                + "/etc/bigbluebutton/nopdfmark.ps" + SPACE
                + source.getAbsolutePath();

        //System.out.println("DOWNSCALING " + COMMAND);

        return new ExternalProcessExecutor().exec(COMMAND, 10000);
    }
}
