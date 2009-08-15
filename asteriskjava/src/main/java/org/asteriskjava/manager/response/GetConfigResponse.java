/*
 *  Copyright 2004-2007 Stefan Reuter and others
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.asteriskjava.manager.response;

import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.Locale;

/**
 * Response that is received when sending a GetConfigAction.
 * <p>
 * Asterisk's response to the GetConfig command is ugly, and requires some
 * parsing of attributes. This class lazily parses its own attributes to hide
 * the ugly details. If the file requested exists but does not contain at least
 * a line with a category, the ResponseBuilder won't create an instance of
 * GetConfigResponse, as it won't know what the empty response is.
 * 
 * @see org.asteriskjava.manager.action.GetConfigAction
 * @author martins
 * @since 0.3
 */
public class GetConfigResponse extends ManagerResponse
{
    private static final long serialVersionUID = -2044248427247227390L;
    
    private Map<Integer, String> categories;
    private Map<Integer, Map<Integer, String>> lines;

    /**
     * Returns the map of category numbers to category names.
     * 
     * @return the map of category numbers to names.
     * @see org.asteriskjava.manager.response.GetConfigResponse#getLines
     */
    public Map<Integer, String> getCategories()
    {
        if (categories == null)
        {
            categories = new TreeMap<Integer, String>();
        }

        Map<String, Object> responseMap = super.getAttributes();
        Set<String> responseKeys = responseMap.keySet();
        for (String key : responseKeys)
        {
            if (key.toLowerCase(Locale.US).contains("category"))
            {
                String[] keyParts = key.split("-");

                // if it doesn't have at least category-XXXXXX, skip
                if (keyParts.length < 2)
                    continue;

                // try to get the number of this category, skip if we mess up
                Integer categoryNumber;
                try
                {
                    categoryNumber = Integer.parseInt(keyParts[1]);
                }
                catch (Exception exception)
                {
                    continue;
                }

                categories.put(categoryNumber, (String) responseMap.get(key));
            }
        }

        return categories;
    }

    /**
     * Returns the map of line number to line value for a given category.
     * 
     * @param categoryNumber a valid category number from getCategories.
     * @return the map of category numbers to names.
     * @see org.asteriskjava.manager.response.GetConfigResponse#getCategories
     */
    public Map<Integer, String> getLines(int categoryNumber)
    {
        if (lines == null)
        {
            lines = new TreeMap<Integer, Map<Integer, String>>();
        }

        Map<String, Object> responseMap = super.getAttributes();
        Set<String> responseKeys = responseMap.keySet();
        for (String key : responseKeys)
        {
            if (key.toLowerCase(Locale.US).contains("line"))
            {
                String[] keyParts = key.split("-");

                // if it doesn't have at least line-XXXXXX-XXXXXX, skip
                if (keyParts.length < 3)
                {
                    continue;
                }

                // try to get the number of this category, skip if we mess up
                Integer potentialCategoryNumber;
                try
                {
                    potentialCategoryNumber = Integer.parseInt(keyParts[1]);
                }
                catch (Exception exception)
                {
                    continue;
                }

                // try to get the number of this line, skip if we mess up
                Integer potentialLineNumber;
                try
                {
                    potentialLineNumber = Integer.parseInt(keyParts[2]);
                }
                catch (Exception exception)
                {
                    continue;
                }

                // get the List out for placing stuff in
                Map<Integer, String> linesForCategory = lines.get(potentialCategoryNumber);
                if (linesForCategory == null)
                {
                    linesForCategory = new TreeMap<Integer, String>();
                }

                // put the line we just parsed into the line map for this category
                linesForCategory.put(potentialLineNumber, (String) responseMap.get(key));
                if (!lines.containsKey(potentialCategoryNumber))
                {
                    lines.put(potentialCategoryNumber, linesForCategory);
                }
            }
        }

        return lines.get(categoryNumber);
    }
}
