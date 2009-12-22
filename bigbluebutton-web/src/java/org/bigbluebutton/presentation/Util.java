package org.bigbluebutton.presentation;

import java.io.File;

public final class Util {
	private Util() {}
	
	public static void deleteDirectory(File directory) {
		/**
		 * Go through each directory and check if it's not empty.
		 * We need to delete files inside a directory before a
		 * directory can be deleted.
		**/
		File[] files = directory.listFiles();				
		for (int i = 0; i < files.length; i++) {
			if (files[i].isDirectory()) {
				deleteDirectory(files[i]);
			} else {
				files[i].delete();
			}
		}
		// Now that the directory is empty. Delete it.
		directory.delete();	
	}
}
