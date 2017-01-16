/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */

package org.bigbluebutton.presentation.imp;

import java.io.File;

import org.bigbluebutton.presentation.PageExtractor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GhostscriptPageExtractor implements PageExtractor {
    private static Logger log = LoggerFactory
            .getLogger(GhostscriptPageExtractor.class);

    private String GHOSTSCRIPT_EXEC;
    private String noPdfMarkWorkaround;
    private String SPACE = " ";

    public boolean extractPage(File presentationFile, File output, int page) {
        String OPTIONS = "-sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH";
        String FIRST_PAGE = "-dFirstPage=" + page;
        String LAST_PAGE = "-dLastPage=" + page;
        String DESTINATION = output.getAbsolutePath();
        String OUTPUT_FILE = "-sOutputFile=" + DESTINATION;

        // extract that specific page and create a temp-pdf(only one page) with
        // GhostScript
        String COMMAND = GHOSTSCRIPT_EXEC + SPACE + OPTIONS + SPACE
                + FIRST_PAGE + SPACE + LAST_PAGE + SPACE + OUTPUT_FILE + SPACE
                + noPdfMarkWorkaround + SPACE
                + presentationFile.getAbsolutePath();

        return new ExternalProcessExecutor().exec(COMMAND, 60000);
    }

    public void setGhostscriptExec(String exec) {
        GHOSTSCRIPT_EXEC = exec;
    }

    public void setNoPdfMarkWorkaround(String noPdfMarkWorkaround) {
        this.noPdfMarkWorkaround = noPdfMarkWorkaround;
    }
}
