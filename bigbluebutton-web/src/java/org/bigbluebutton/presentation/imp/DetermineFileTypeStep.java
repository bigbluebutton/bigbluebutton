package org.bigbluebutton.presentation.imp;

import java.io.File;
import org.bigbluebutton.presentation.SupportedFileTypes;

public class DetermineFileTypeStep {

	public boolean isSupported(String conference, String room, String presentationName, File presentationFile) {
		
		/* Getting file extension - Perhaps try to rely on smth more accurate than an extension type ? */
		int fileExtIndex = presentationFile.getName().lastIndexOf('.') + 1;
		String ext = presentationFile.getName().toLowerCase().substring(fileExtIndex);
		return SupportedFileTypes.isFileSupported(ext);
	}
}
