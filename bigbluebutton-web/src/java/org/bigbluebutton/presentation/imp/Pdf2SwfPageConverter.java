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

import org.bigbluebutton.presentation.PageConverter;
import org.bigbluebutton.presentation.handlers.Pdf2SwfPageConverterHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.zaxxer.nuprocess.NuProcess;
import com.zaxxer.nuprocess.NuProcessBuilder;

public class Pdf2SwfPageConverter implements PageConverter {
  private static Logger log = LoggerFactory
      .getLogger(Pdf2SwfPageConverter.class);

  private String SWFTOOLS_DIR;
  private String fontsDir;

  public boolean convert(File presentation, File output, int page) {
    String source = presentation.getAbsolutePath();
    String dest = output.getAbsolutePath();
    String AVM2SWF = "-T9";

    NuProcessBuilder pb = new NuProcessBuilder(Arrays.asList(SWFTOOLS_DIR
        + File.separator + "pdf2swf", "-v", AVM2SWF, "-F", fontsDir, "-p",
        String.valueOf(page), source, "-o", "dest"));
    Pdf2SwfPageConverterHandler pHandler = new Pdf2SwfPageConverterHandler();
    pb.setProcessListener(pHandler);
    NuProcess process = pb.start();
    try {
      process.waitFor(60, TimeUnit.SECONDS);
    } catch (InterruptedException e) {
      log.error(e.getMessage());
    }
    boolean done = pHandler.isConversionSuccessfull();

    File destFile = new File(dest);
    if (done && destFile.exists()) {
      return true;
    } else {

      NuProcessBuilder pbBmp = new NuProcessBuilder(Arrays.asList(SWFTOOLS_DIR
          + File.separator, "pdf2swf", "-v", AVM2SWF, "-s", "poly2bitmap",
          "-F", fontsDir, "-p", String.valueOf(page), source, "-o", dest));
      Pdf2SwfPageConverterHandler pBmpHandler = new Pdf2SwfPageConverterHandler();
      pbBmp.setProcessListener(pBmpHandler);
      NuProcess processBmp = pbBmp.start();
      try {
        processBmp.waitFor(60, TimeUnit.SECONDS);
      } catch (InterruptedException e) {
        log.error(e.getMessage());
      }
      boolean doneBmp = pBmpHandler.isConversionSuccessfull();

      if (doneBmp && destFile.exists()) {
        return true;
      } else {
        log.warn("Failed to convert: " + dest + " does not exist.");
        return false;
      }
    }
  }

  public void setSwfToolsDir(String dir) {
    SWFTOOLS_DIR = dir;
  }

  public void setFontsDir(String dir) {
    fontsDir = dir;
  }
}
