/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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
package org.bigbluebutton.app.video;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.slf4j.Logger;
import org.springframework.core.io.Resource;

public class DemoService {

	private static Logger log = Red5LoggerFactory.getLogger(DemoService.class, "video");
	
	{
		log.info("oflaDemo DemoService created");
	}
	
	private String formatDate(Date date) {
		SimpleDateFormat formatter;
		String pattern = "dd/MM/yy H:mm:ss";
		Locale locale = new Locale("en", "US");
		formatter = new SimpleDateFormat(pattern, locale);
		return formatter.format(date);
	}

	/**
	 * Getter for property 'listOfAvailableFLVs'.
	 *
	 * @return Value for property 'listOfAvailableFLVs'.
	 */
	public Map<String, Map<String, Object>> getListOfAvailableFLVs() {
		IScope scope = Red5.getConnectionLocal().getScope();
		Map<String, Map<String, Object>> filesMap = new HashMap<String, Map<String, Object>>();
		try {
			log.debug("getting the FLV files");
			addToMap(filesMap, scope.getResources("streams/*.flv"));

			addToMap(filesMap, scope.getResources("streams/*.f4v"));

			addToMap(filesMap, scope.getResources("streams/*.mp3"));
			
			addToMap(filesMap, scope.getResources("streams/*.mp4"));

			addToMap(filesMap, scope.getResources("streams/*.m4a"));

			addToMap(filesMap, scope.getResources("streams/*.3g2"));			

			addToMap(filesMap, scope.getResources("streams/*.3gp"));			
			
		} catch (IOException e) {
			log.error("", e);
		}
		return filesMap;
	}

	private void addToMap(Map<String, Map<String, Object>> filesMap, Resource[] files)
			throws IOException {
		if (files != null) {
			for (Resource flv : files) {
				File file = flv.getFile();
				Date lastModifiedDate = new Date(file.lastModified());
				String lastModified = formatDate(lastModifiedDate);
				String flvName = flv.getFile().getName();
				String flvBytes = Long.toString(file.length());
				if (log.isDebugEnabled()) {
					log.debug("flvName: {}", flvName);
					log.debug("lastModified date: {}", lastModified);
					log.debug("flvBytes: {}", flvBytes);
					log.debug("-------");
				}
				Map<String, Object> fileInfo = new HashMap<String, Object>();
				fileInfo.put("name", flvName);
				fileInfo.put("lastModified", lastModified);
				fileInfo.put("size", flvBytes);
				filesMap.put(flvName, fileInfo);
			}
		}
	}

}
