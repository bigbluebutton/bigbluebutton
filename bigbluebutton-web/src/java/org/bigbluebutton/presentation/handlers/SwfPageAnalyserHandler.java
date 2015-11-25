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

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SwfPageAnalyserHandler extends AbstractPageConverterHandler {

  private static Logger log = LoggerFactory
      .getLogger(SwfPageAnalyserHandler.class);

  private static String FONT_NULL_GLYPH = "glyph codepoint='0(?)'";
  private static String SYMBOL_REDEFINED = "redefined by identical tag";
  private static String DEFINE_SHAPE3 = "DefineShape3";
  private int maxSwfShapes;

  @Override
  public Boolean isConversionSuccessfull() {
    if (exitCode == 0) {
      int matches = StringUtils.countMatches(stdoutBuilder.toString(),
          DEFINE_SHAPE3);
      // We divide the matches by two because we were looking at an XML tag name
      matches *= 0.5;
      log.debug("Defined shapes in the SWF " + matches);
      if (matches > maxSwfShapes) {
        log.error("SWF contains too much Shapes defined, the maximum allowed number is "
            + maxSwfShapes);
        return false;
      }
      return true;
    } else {
      if (stdoutContains(FONT_NULL_GLYPH)) {
        log.error("SWF contains invalid font glyph dfintion");
      } else if (stdoutContains(SYMBOL_REDEFINED)) {
        log.error("A SWF symbol was defined twice");
      } else {
        log.error("The SWF is not compliant due to an unknown error");
        log.error(stdoutBuilder.toString());
      }
      log.error(stderrBuilder.toString());
      return false;
    }
  }

  public void setMaxSwfShapes(int maxSwfShapes) {
    this.maxSwfShapes = maxSwfShapes;
  }
}
