package org.bigbluebutton.presentation;

import java.io.File;

public interface PageConverter {

	public boolean convert(File presentation, File output, int page);
}
