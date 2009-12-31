package org.bigbluebutton.presentation.imp;

@SuppressWarnings("serial")
public class CountingPageException extends Exception {

	private final int maxNumberOfPages;
	private final ExceptionType exceptionType;
	private final int pageCount;
	
	public enum ExceptionType {PAGE_COUNT_EXCEPTION, PAGE_EXCEEDED_EXCEPTION};
	
	public CountingPageException(ExceptionType type, int pageCount, int maxNumberOfPages) {
		super("Exception while trying to determine number of pages.");
		this.pageCount = pageCount;
		this.maxNumberOfPages = maxNumberOfPages;
		exceptionType = type;
	}
	
	public int getMaxNumberOfPages() {
		return maxNumberOfPages;
	}

	public ExceptionType getExceptionType() {
		return exceptionType;
	}

	public int getPageCount() {
		return pageCount;
	}	
}
