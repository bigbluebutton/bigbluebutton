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

import com.zaxxer.nuprocess.NuProcess;
import com.zaxxer.nuprocess.NuProcessBuilder;
import org.bigbluebutton.presentation.ImageResolution;
import org.bigbluebutton.presentation.handlers.ImageResolutionServiceHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.File;
import java.util.Arrays;
import java.util.concurrent.TimeUnit;

public class ImageResolutionService {
  private static Logger log = LoggerFactory.getLogger(ImageResolutionService.class);

  private int wait = 5;

  public ImageResolution identifyImageResolution(File presentationFile) {

    NuProcessBuilder imageResolution = new NuProcessBuilder(
        Arrays.asList("/usr/share/bbb-web/run-in-systemd.sh", String.valueOf(wait),
                "identify", "-format","%w %h", presentationFile.getAbsolutePath()));

    ImageResolutionServiceHandler imgResHandler = new ImageResolutionServiceHandler("imgresolution-" + presentationFile.getName());
    imageResolution.setProcessListener(imgResHandler);

    NuProcess process = imageResolution.start();
    try {
      process.waitFor(wait + 1, TimeUnit.SECONDS);
    } catch (InterruptedException e) {
      log.error("InterruptedException while identifying image resolution {}", presentationFile.getName(), e);
    }

    return new ImageResolution(imgResHandler.getWidth(), imgResHandler.getHeight());
  }

  public void setWait(int wait) {
    this.wait = wait;
  }
}
