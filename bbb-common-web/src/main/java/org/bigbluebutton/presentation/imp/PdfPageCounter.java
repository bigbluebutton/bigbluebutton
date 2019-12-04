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
import java.util.Arrays;
import java.util.concurrent.TimeUnit;

import org.bigbluebutton.presentation.PageCounter;
import org.bigbluebutton.presentation.handlers.PdfPageCounterHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.zaxxer.nuprocess.NuProcess;
import com.zaxxer.nuprocess.NuProcessBuilder;

public class PdfPageCounter implements PageCounter {
  private static Logger log = LoggerFactory.getLogger(PdfPageCounter.class);

  private static int waitForSec = 5;

  public int countNumberOfPages(File presentationFile) {
    int numPages = 0; // total numbers of this pdf

    NuProcessBuilder pdfInfo = new NuProcessBuilder(
        Arrays.asList("pdfinfo", presentationFile.getAbsolutePath()));

    PdfPageCounterHandler pHandler = new PdfPageCounterHandler();
    pdfInfo.setProcessListener(pHandler);

    NuProcess process = pdfInfo.start();
    try {
      process.waitFor(waitForSec, TimeUnit.SECONDS);
    } catch (InterruptedException e) {
      log.error("InterruptedException while counting PDF pages {}", presentationFile.getName(), e);
    }

    numPages = pHandler.numberOfPages();
    return numPages;
  }

}
