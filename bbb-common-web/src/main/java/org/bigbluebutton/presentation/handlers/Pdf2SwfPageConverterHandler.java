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
package org.bigbluebutton.presentation.handlers;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * The default command output the anlayse looks like the following: </br>
 * 20 DEBUG Using</br>
 * 60 VERBOSE Updating font</br>
 * 80 VERBOSE Drawing
 *
 */
public class Pdf2SwfPageConverterHandler extends AbstractCommandHandler {

  private static Logger log = LoggerFactory
      .getLogger(Pdf2SwfPageConverterHandler.class);

  private static final String PLACEMENT_OUTPUT = "DEBUG  Using";
  private static final String TEXT_TAG_OUTPUT = "VERBOSE Updating";
  private static final String IMAGE_TAG_OUTPUT = "VERBOSE Drawing";
  private static final String PLACEMENT_PATTERN = "\\d+\\s" + PLACEMENT_OUTPUT;
  private static final String TEXT_TAG_PATTERN = "\\d+\\s" + TEXT_TAG_OUTPUT;
  private static final String IMAGE_TAG_PATTERN = "\\d+\\s" + IMAGE_TAG_OUTPUT;

  /**
   * 
   * @return The number of PlaceObject2 tags in the generated SWF
   */
  public long numberOfPlacements() {
    if (stdoutContains(PLACEMENT_OUTPUT)) {
      try {
        String out = stdoutBuilder.toString();
        Pattern r = Pattern.compile(PLACEMENT_PATTERN);
        Matcher m = r.matcher(out);
        m.find();
        return Integer
            .parseInt(m.group(0).replace(PLACEMENT_OUTPUT, "").trim());
      } catch (Exception e) {
        return 0;
      }
    }
    return 0;
  }

  /**
   * 
   * @return The number of text tags in the generated SWF.
   */
  public long numberOfTextTags() {
    if (stdoutContains(TEXT_TAG_OUTPUT)) {
      try {
        String out = stdoutBuilder.toString();
        Pattern r = Pattern.compile(TEXT_TAG_PATTERN);
        Matcher m = r.matcher(out);
        m.find();
        return Integer.parseInt(m.group(0).replace(TEXT_TAG_OUTPUT, "").trim());
      } catch (Exception e) {
        return 0;
      }
    }
    return 0;
  }

  /**
   * 
   * @return The number of image tags in the generated SWF.
   */
  public long numberOfImageTags() {
    if (stdoutContains(IMAGE_TAG_OUTPUT)) {
      try {
        String out = stdoutBuilder.toString();
        Pattern r = Pattern.compile(IMAGE_TAG_PATTERN);
        Matcher m = r.matcher(out);
        m.find();
        return Integer
            .parseInt(m.group(0).replace(IMAGE_TAG_OUTPUT, "").trim());
      } catch (Exception e) {
        return 0;
      }
    }
    return 0;
  }

}
