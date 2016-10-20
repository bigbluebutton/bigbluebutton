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
package org.bigbluebutton.screenshare.client;

public class VersionCheckUtil {

  public static boolean validateMinJREVersion(String runtimeVersion, String minVersion){
    String[] requestedVersioning = minVersion.split("\\.");
    String[] clientVersioning = runtimeVersion.split("\\.");

    if (requestedVersioning.length < 3 || clientVersioning.length < 3)
      return false;

    // First major update
    if (Integer.parseInt(clientVersioning[0]) > Integer.parseInt(requestedVersioning[0]))
      return true;
    else{
      // Checking Java version
      if (Integer.parseInt(clientVersioning[1]) > Integer.parseInt(requestedVersioning[1]))
        return true;

      // Checking update
      else if (Integer.parseInt(clientVersioning[1]) == Integer.parseInt(requestedVersioning[1])){	
        // non-GA or non-FCS release won't be supported
        if(clientVersioning[2].indexOf("-") != -1)
          return false;

        int rUpdatePart1 = 0;
        int rUpdatePart2 = 0;

        int underbar = requestedVersioning[2].indexOf("_");
        if ( underbar == -1){
          rUpdatePart1 = Integer.parseInt(requestedVersioning[2]);
        } else {
          rUpdatePart1 = Integer.parseInt(requestedVersioning[2].substring(0, underbar));
          rUpdatePart2 = Integer.parseInt(requestedVersioning[2].substring(underbar + 1, requestedVersioning[2].length()));	
        }

        int cUpdatePart1 = 0;
        int cUpdatePart2 = 0;

        underbar = clientVersioning[2].indexOf("_");
        if ( underbar == -1) {
          cUpdatePart1 = Integer.parseInt(clientVersioning[2]);
        } else {
          cUpdatePart1 = Integer.parseInt(clientVersioning[2].substring(0, underbar));
          cUpdatePart2 = Integer.parseInt(clientVersioning[2].substring(underbar + 1, clientVersioning[2].length()));	
        }

        if (cUpdatePart1 > rUpdatePart1)
          return true;
        else if (cUpdatePart1 == rUpdatePart1) {
          if (cUpdatePart2 > rUpdatePart2 || cUpdatePart2 == rUpdatePart2)
            return true;
          else
            return false;
        } else
          return false;
      } else
        return false;
    }
  }

}
