package org.bigbluebutton.app.video;

import java.util.HashMap;
import java.util.Map;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class DemoServiceImpl implements IDemoService {
	
	private static Logger log = Red5LoggerFactory.getLogger(DemoServiceImpl.class, "oflaDemo");
	
	/**
     * Getter for property 'listOfAvailableFLVs'.
     *
     * @return Value for property 'listOfAvailableFLVs'.
     */
    public Map<String, Map<String, Object>> getListOfAvailableFLVs() {
    	log.debug("getListOfAvailableFLVs empty");
		return new HashMap<String, Map<String, Object>>(1);
	}

    public Map<String, Map<String, Object>> getListOfAvailableFLVs(String string) {
    	log.debug("getListOfAvailableFLVs, Got a string: {}", string);
    	return getListOfAvailableFLVs();
    }

}

