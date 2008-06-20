package org.red5.server.webapp.oflaDemo;

import java.util.HashMap;
import java.util.Map;

public class DemoServiceImpl implements IDemoService {
	/**
     * Getter for property 'listOfAvailableFLVs'.
     *
     * @return Value for property 'listOfAvailableFLVs'.
     */
    public Map getListOfAvailableFLVs() {
    	System.out.println("getListOfAvailableFLVs empty");
		return new HashMap(1);
	}

    public Map getListOfAvailableFLVs(String string) {
    	System.out.println("getListOfAvailableFLVs, Got a string: " + string);
    	return getListOfAvailableFLVs();
    }

}

