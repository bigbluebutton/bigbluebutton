package org.bigbluebutton.presentation;

import java.io.File;

public interface PageExtractor {

	public boolean extractPage(File presentationFile, File output, int page);
}
