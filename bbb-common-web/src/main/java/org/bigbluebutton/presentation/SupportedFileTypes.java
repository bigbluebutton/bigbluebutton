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

package org.bigbluebutton.presentation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.bigbluebutton.presentation.FileTypeConstants.*;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;
import java.util.Collections;

@SuppressWarnings("serial")
public final class SupportedFileTypes {

	private static Logger log = LoggerFactory.getLogger(SupportedFileTypes.class);
	private static MimeTypeUtils mimeTypeUtils = new MimeTypeUtils();

	private static final List<String> SUPPORTED_FILE_LIST = Collections.unmodifiableList(new ArrayList<String>(15) {		
		{				
			// Add all the supported files				
			add(XLS); add(XLSX);	add(DOC); add(DOCX); add(PPT); add(PPTX);				
			add(ODT); add(RTF); add(TXT); add(ODS); add(ODP); add(PDF);
			add(JPG); add(JPEG); add(PNG);
		}
	});
		
	private static final List<String> OFFICE_FILE_LIST = Collections.unmodifiableList(new ArrayList<String>(11) {		
		{			
			// Add all Offile file types
			add(XLS); add(XLSX);	add(DOC); add(DOCX); add(PPT); add(PPTX);				
			add(ODT); add(RTF); add(TXT); add(ODS); add(ODP); 
		}
	});
	
	private static final List<String> IMAGE_FILE_LIST = Collections.unmodifiableList(new ArrayList<String>(3) {		
		{	
			// Add all image file types
			add(JPEG); add(JPG); add(PNG);
		}
	});
	
	/*
	 * Returns if the file with extension is supported.
	 */
	public static boolean isFileSupported(String fileExtension) {
		return SUPPORTED_FILE_LIST.contains(fileExtension.toLowerCase());
	}
	
	/*
	 * Returns if the office file is supported.
	 */
	public static boolean isOfficeFile(String fileExtension) {
		return OFFICE_FILE_LIST.contains(fileExtension.toLowerCase());
	}
	
	public static boolean isPdfFile(String fileExtension) {
		return "pdf".equalsIgnoreCase(fileExtension);
	}
	
	/*
	 * Returns if the iamge file is supported
	 */
	public static boolean isImageFile(String fileExtension) {
		return IMAGE_FILE_LIST.contains(fileExtension.toLowerCase());
	}

	/*
	 * It was tested native java methods to detect mimetypes, such as:
	 *   - URLConnection.guessContentTypeFromStream(InputStream is);
	 *   - Files.probeContentType(Path path);
	 *   - FileNameMap fileNameMap.getContentTypeFor(String file.getName());
	 *   - MimetypesFileTypeMap fileTypeMap.getContentType(File file);
	 * But none of them was as successful as the linux based command
	 */
	public static String detectMimeType(File pres) {
		try {
			if (pres == null) throw new NullPointerException("Presentation is null");
			if (!pres.isFile()) throw new RuntimeException("Presentation is not a file");

			ProcessBuilder processBuilder = new ProcessBuilder();
			processBuilder.command("bash", "-c", "file -b --mime-type \"" + pres.getAbsolutePath() + "\"");
			Process process = processBuilder.start();
			StringBuilder output = new StringBuilder();
			BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
			String line;
			while ((line = reader.readLine()) != null) {
				output.append(line + "\n");
			}
			int exitVal = process.waitFor();
			if (exitVal == 0) {
				return output.toString().trim();
			} else {
				String executedCommand = processBuilder.command().toArray(new String[0])[2];

				//Read error stream
				BufferedReader stdError = new BufferedReader(new InputStreamReader(process.getErrorStream()));
				StringBuilder errorString = new StringBuilder();
				while (stdError.ready()) {
					errorString.append(stdError.readLine());
					if (stdError.ready()) {
						errorString.append("\n");
					}
				}

				log.error("Error while executing command '{}': {}", executedCommand, errorString);

				if (exitVal == 127) {
					// 127 - command not found
					// use Java method to detect in this case (based on file name)
					return URLConnection.getFileNameMap().getContentTypeFor(pres.getAbsolutePath());
				} else {
					throw new RuntimeException(errorString.toString());
				}
			}
		} catch (Exception e) {
			log.error("Error while executing detectMimeType: {}", e.getMessage());
		}

		return "";
	}

	public static Boolean isPresentationMimeTypeValid(File pres, String fileExtension) {
		String mimeType = detectMimeType(pres);

		if (mimeType == null || mimeType.equals("")) {
			return false;
		}

		if (!mimeTypeUtils.getValidMimeTypes().contains(mimeType)) {
			return false;
		}

		if (!mimeTypeUtils.extensionMatchMimeType(mimeType, fileExtension)) {
			log.error("File with extension [{}] doesn't match with mimeType [{}].", fileExtension, mimeType);
			return false;
		}

		return true;
	}
}
