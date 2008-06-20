package org.red5.server.webapp.oflaDemo;

import java.util.Map;

public interface IDemoService {

	/**
     * Getter for property 'listOfAvailableFLVs'.
     *
     * @return Value for property 'listOfAvailableFLVs'.
     */
    public Map getListOfAvailableFLVs();

    public Map getListOfAvailableFLVs(String string);

}
