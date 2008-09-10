package org.red5.server.webapp.oflaDemo;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.springframework.core.io.Resource;

public class DemoService {

	protected static Logger log = LoggerFactory.getLogger(DemoService.class);

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
	public Map getListOfAvailableFLVs() {
		IScope scope = Red5.getConnectionLocal().getScope();
		Map<String, Map> filesMap = new HashMap<String, Map>();
		try {
			log.debug("getting the FLV files");
			Resource[] flvs = scope.getResources("streams/*.flv");
			addToMap(filesMap, flvs);

			Resource[] mp3s = scope.getResources("streams/*.mp3");
			addToMap(filesMap, mp3s);

			
		} catch (IOException e) {
			log.error("{}", e);
		}
		return filesMap;
	}

	private void addToMap(Map<String, Map> filesMap, Resource[] files)
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
