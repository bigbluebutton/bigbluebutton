/* BigBlueButton - http://www.bigbluebutton.org
 * 
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Richard Alam <ritzalam@gmail.com>
 * 		   DJP <DJP@architectes.org>
 * 
 * @version $Id: $
 */
package org.bigbluebutton.presentation;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class SupportedDocumentFilter {
	
	private ConversionProgressNotifier notifier;
	
	public boolean isSupported(UploadedPresentation pres) {
		File presentationFile = pres.getUploadedFile();
		
		/* Get file extension - Perhaps try to rely on a more accurate method than an extension type ? */
		int fileExtIndex = presentationFile.getName().lastIndexOf('.') + 1;
		String ext = presentationFile.getName().toLowerCase().substring(fileExtIndex);
		boolean supported = SupportedFileTypes.isFileSupported(ext);
		notifyProgressListener(supported, pres);
		if (supported) {
			pres.setFileType(ext);
		}
		return supported;
	}
	
	private void notifyProgressListener(boolean supported, UploadedPresentation pres) {
		Map<String, Object> msg = new HashMap<String, Object>();
		msg.put("conference", pres.getConference());
		msg.put("room", pres.getRoom());
		msg.put("step", "FILTER");
		
		if (supported) {
			msg.put("status", "OK");
			msg.put("message", "Document is supported");
			msg.put("messageKey", "SUPPORTED_DOCUMENT");
		} else {
			msg.put("status", "FAILED");
			msg.put("message", "Document is not supported");
			msg.put("messageKey", "UNSUPPORTED_DOCUMENT");
		}
		
		if (notifier != null) notifier.sendConversionProgress(msg);	
	}
	
	public void setConversionProgressNotifier(ConversionProgressNotifier notifier) {
		this.notifier = notifier;
	}
}
