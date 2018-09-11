/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * <p>
 * Copyright (c) 2018 BigBlueButton Inc. and by respective authors (see below).
 * <p>
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * <p>
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * <p>
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 */

package org.bigbluebutton.presentation.imp;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;

import org.bigbluebutton.presentation.ImageResizer;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.bigbluebutton.presentation.handlers.ImageResizerHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.zaxxer.nuprocess.NuProcess;
import com.zaxxer.nuprocess.NuProcessBuilder;

public class ImageResizerImp implements ImageResizer {
    private static Logger log = LoggerFactory.getLogger(ImageResizerImp.class);

    private static int waitForSec = 7;

    public boolean resize(UploadedPresentation pres, String ratio) {
        Boolean conversionSuccess = true;

        log.debug("Rescaling file {} with {} ratio", pres.getUploadedFile().getAbsolutePath(), ratio);
        NuProcessBuilder imgResize = new NuProcessBuilder(Arrays.asList("convert", "-resize", ratio,
                pres.getUploadedFile().getAbsolutePath(), pres.getUploadedFile().getAbsolutePath()));

        ImageResizerHandler pHandler = new ImageResizerHandler();
        imgResize.setProcessListener(pHandler);

        NuProcess process = imgResize.start();
        try {
            process.waitFor(waitForSec, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            log.error(e.getMessage());
            conversionSuccess = false;
        }

        return conversionSuccess;
    }

}
