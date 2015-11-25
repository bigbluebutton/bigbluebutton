/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2015 BigBlueButton Inc. and by respective authors (see below).
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

import org.bigbluebutton.presentation.PageAnalyser;
import org.bigbluebutton.presentation.handlers.SwfPageAnalyserHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.zaxxer.nuprocess.NuProcess;
import com.zaxxer.nuprocess.NuProcessBuilder;

public class SwfAnalyser implements PageAnalyser {

  private static Logger log = LoggerFactory.getLogger(SwfAnalyser.class);

  private String SWFTOOLS_DIR;

  // @fixme: move to Spring configuration file
  private int maxSwfShapes = 5000;

  @Override
  public boolean analyse(File output) {
    NuProcessBuilder pb = new NuProcessBuilder(Arrays.asList(SWFTOOLS_DIR,
        "swfdump", output.getAbsolutePath()));
    SwfPageAnalyserHandler handler = new SwfPageAnalyserHandler();
    handler.setMaxSwfShapes(maxSwfShapes);
    log.debug("$$ Executing command: " + pb.command().toString());
    pb.setProcessListener(handler);
    NuProcess process = pb.start();
    try {
      process.waitFor(60, TimeUnit.SECONDS);
    } catch (InterruptedException e) {
      log.error(e.getMessage());
    }
    return handler.isConversionSuccessfull();
  }

  public void setSwfToolsDir(String dir) {
    SWFTOOLS_DIR = dir;
  }

  public void setMaxSwfShapes(int maxSwfShapes) {
    this.maxSwfShapes = maxSwfShapes;
  }

}
