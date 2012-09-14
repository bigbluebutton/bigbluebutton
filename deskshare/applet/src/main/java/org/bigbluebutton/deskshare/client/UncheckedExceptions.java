package org.bigbluebutton.deskshare.client;
class UncheckedExceptions {
	private static Throwable throwable;

	private UncheckedExceptions() throws Throwable {
        	throw throwable;
	}

	public static synchronized void spit(Throwable throwable) {
        	UncheckedExceptions.throwable = throwable;
		try {
			UncheckedExceptions.class.newInstance();
		} catch(InstantiationException e) {
		} catch(IllegalAccessException e) {
		} finally {
			UncheckedExceptions.throwable = null;
		}	
	}
}

