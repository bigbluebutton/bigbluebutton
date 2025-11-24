/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.presentation.handlers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ImageResolutionServiceHandler extends AbstractCommandHandler {

  private static Logger log = LoggerFactory
      .getLogger(ImageResolutionServiceHandler.class);

  private final String id;

  public ImageResolutionServiceHandler(String id) {
    this.id = id;
  }

  /**
   * @return The resolution of the provided image
   */
  public int getWidth() {
    try {
      String[] outputParts = stdoutBuilder.toString().split(" ");

      if(outputParts.length == 2) {
        try {
            return Integer.parseInt(outputParts[0]);
        } catch (NumberFormatException e) {
            log.error("Received width is not an integer {}", outputParts[0]);
        }
      }
    } catch (Exception e) {
      log.error("Exception identifying width of the image", e);
    }
    return 0;
  }

  public int getHeight() {
    try {
      String[] outputParts = stdoutBuilder.toString().split(" ");

      if(outputParts.length == 2) {
        try {
            return Integer.parseInt(outputParts[1]);
        } catch (NumberFormatException e) {
            log.error("Received height is not an integer {}", outputParts[1]);
        }
      }
    } catch (Exception e) {
      log.error("Exception identifying height of the image", e);
    }
    return 0;
  }

  @Override
  protected String getIdTag() {
    return id;
  }
}
