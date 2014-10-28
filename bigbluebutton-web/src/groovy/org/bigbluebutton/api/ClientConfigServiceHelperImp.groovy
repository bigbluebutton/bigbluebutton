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

package org.bigbluebutton.api;

import java.io.File;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ClientConfigServiceHelperImp implements IClientConfigServiceHelper {
	private static Logger log = LoggerFactory.getLogger(ClientConfigServiceHelperImp.class);

		
	public Map<String, String> getPreBuiltConfigs(String dir) {
		Map<String, String> configs = new HashMap<String, String>();
		
		File confDir = new File(dir);
		if (confDir.isDirectory()) {
			File[] files = confDir.listFiles();
			for (int i = 0; i < files.length; i++) {
				if (! files[i].isDirectory()) {
					File file = files[i]
				  configs.put(file.name, file.text)
				}
			}		
		}
		return configs;
	}
	
}
