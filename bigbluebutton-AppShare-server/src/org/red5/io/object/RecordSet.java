package org.red5.io.object;

/*
 * RED5 Open Source Flash Server - http://www.osflash.org/red5
 * 
 * Copyright (c) 2006-2007 by respective authors (see below). All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 2.1 of the License, or (at your option) any later 
 * version. 
 * 
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with this library; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 */

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.red5.server.net.remoting.RemotingClient;

// TODO: Auto-generated Javadoc
/**
 * Read only RecordSet object that might be received through remoting calls. There are 3 types of data fetching:
 * 
 * <ul>
 * <li>On demand (used by default)</li>
 * <li>Fetch all at once</li>
 * <li>Page-by-page fetching</li>
 * </ul>
 * 
 * <p>For last mode, use <tt>page size</tt> property to specify maximum number of rows on one page</p>
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 * @see <a href="http://www.osflash.org/amf/recordset">osflash.org documentation</a>
 */
public class RecordSet {
    
    /** On demand fetching mode. */
	private static final String MODE_ONDEMAND = "ondemand";
    
    /** Fetch all at once fetching mode. */
	private static final String MODE_FETCHALL = "fetchall";
    
    /** Page-by-page fetching mode. */
	private static final String MODE_PAGE = "page";
    
    /** Total number of pages. */
	private int totalCount;
    
    /** Recordset data. */
	private List<List<Object>> data;
    
    /** Recordset cursor. */
	private int cursor;

    /** Name of service. */
    private String serviceName;

    /** Recordset column names set. */
    private List<String> columns;
    
    /** Recordset version. */
	private int version;
    
    /** Recordset id. */
	private Object id;
    
    /** Remoting client that fetches data. */
	private RemotingClient client;
    
    /** Fetching mode, on demand by default. */
	private String mode = MODE_ONDEMAND;
    
    /** Page size. */
	private int pageSize = 25;

    /**
     * Creates recordset from Input object.
     * 
     * @param input the input
     */
    public RecordSet(Input input) {
        // Create deserializer
        Deserializer deserializer = new Deserializer();
		Map<String, Object> dataMap = input.readKeyValues(deserializer);

		Object map = dataMap.get("serverinfo");
		Map<String, Object> serverInfo = null;
		if (map != null) {
			serverInfo = (Map<String, Object>) map;
			totalCount = (Integer) serverInfo.get("totalCount");
			List<List<Object>> initialData = (List<List<Object>>) serverInfo.get("initialData");
			cursor = (Integer) serverInfo.get("cursor");
			serviceName = (String) serverInfo.get("serviceName");
			columns = (List<String>) serverInfo.get("columnNames");
			version = (Integer) serverInfo.get("version");
			id = serverInfo.get("id");

			this.data = new ArrayList<List<Object>>(totalCount);
			for (int i = 0; i < initialData.size(); i++) {
				this.data.add(i + cursor - 1, initialData.get(i));
			}		
		} else if (!(map instanceof Map)) {
			throw new RuntimeException("Expected Map but got " + map.getClass().getName());
		}
	}

	/**
	 * Set the remoting client to use for retrieving of paged results.
	 * 
	 * @param client     Remoting client that works with this Recordset
	 */
	public void setRemotingClient(RemotingClient client) {
		this.client = client;
	}

	/**
	 * Set the mode for fetching paged results.
	 * 
	 * @param mode       Mode for fetching of results
	 */
	public void setDeliveryMode(String mode) {
		setDeliveryMode(mode, 25, 0);
	}

	/**
	 * Set the mode for fetching paged results with given max page size.
	 * 
	 * @param mode       Mode for fetching of results
	 * @param pageSize   Max page size
	 */
	public void setDeliveryMode(String mode, int pageSize) {
		setDeliveryMode(mode, pageSize, 0);
	}

	/**
	 * Set the mode for fetching paged results with given max page size and number of prefetched pages.
	 * 
	 * @param mode              Mode for fetching of results
	 * @param pageSize          Max page size
	 * @param prefetchCount     Number of prefetched pages (not implemented yet)
	 */
	public void setDeliveryMode(String mode, int pageSize, int prefetchCount) {
		this.mode = mode;
		this.pageSize = pageSize;
	}


    /**
     * Return a list containing the names of the columns in the recordset.
     * 
     * @return Column names set
     */
	public List<String> getColumnNames() {
		return Collections.unmodifiableList(columns);
	}

	/**
	 * Make sure the passed item has been fetched from the server.
	 * 
	 * @param index  Item index
	 */
	private void ensureAvailable(int index) {
		if (data.get(index) != null) {
			// Already have this item.
			return;
		}

		if (client == null) {
			throw new RuntimeException("no remoting client configured");
		}

		Object result;
		int start = index;
		int count;
		if (mode.equals(MODE_ONDEMAND)) {
			// Only get requested item
			count = 1;
		} else if (mode.equals(MODE_FETCHALL)) {
			// Get remaining items
			count = totalCount - cursor;
		} else if (mode.equals(MODE_PAGE)) {
			// Get next page
			// TODO: implement prefetching of multiple pages
			count = 1;
			for (int i = 1; i < pageSize; i++) {
				if (this.data.get(start + i) == null) {
					count += 1;
				}
			}
		} else {
			// Default to "ondemand"
			count = 1;
		}

		result = client.invokeMethod(serviceName + ".getRecords", new Object[] {
				id, start + 1, count });
		if (!(result instanceof RecordSetPage)) {
			throw new RuntimeException("expected RecordSetPage but got "
					+ result);
		}

		RecordSetPage page = (RecordSetPage) result;
		if (page.getCursor() != start + 1) {
			throw new RuntimeException("expected offset " + (start + 1)
					+ " but got " + page.getCursor());
		}

		List<List<Object>> data = page.getData();
		if (data.size() != count) {
			throw new RuntimeException("expected " + count
					+ " results but got " + data.size());
		}

		// Store received items
		for (int i = 0; i < count; i++) {
			this.data.add(start + i, data.get(i));
		}
	}

	/**
	 * Return a specified item from the recordset.  If the item is not
	 * available yet, it will be received from the server.
	 * 
	 * @param index         Item index
	 * 
	 * @return              Item from recordset
	 */
	public List<Object> getItemAt(int index) {
		if (index < 0 || index >= totalCount) {
			// Out of range
			return null;
		}

		ensureAvailable(index);
		return data.get(index);
	}

	/**
	 * Get the total number of items.
	 * 
	 * @return Number of items
	 */
	public int getLength() {
		return totalCount;
	}

	/**
	 * Get the number of items already received from the server.
	 * 
	 * @return Nsumber of received items
	 */
	public int getNumberAvailable() {
		int result = 0;
		for (int i = 0; i < data.size(); i++) {
			if (data.get(i) != null) {
				result += 1;
			}
		}
		return result;
	}

	/**
	 * Check if all items are available on the client.
	 * 
	 * @return number of available items
	 */
	public boolean isFullyPopulated() {
		return getNumberAvailable() == getLength();
	}

	/**
	 * Return Map that can be serialized as result.
	 * 
	 * @return serializable informations
	 */
	public Map<String,Object> serialize() {
		Map<String, Object> serverInfo = new HashMap<String, Object>();
		serverInfo.put("totalCount", totalCount);
		serverInfo.put("cursor", cursor);
		serverInfo.put("serviceName", serviceName);
		serverInfo.put("columnNames", columns);
		serverInfo.put("version", version);
		serverInfo.put("id", id);
		serverInfo.put("initialData", data);
		
		return serverInfo;
	}
}
