/* BigBlueButton - http://www.bigbluebutton.org
 * 
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Richard Alam <ritzalam@gmail.com>
 * 
 * @version $Id: $
 */
package org.bigbluebutton.pbx;

import groovy.lang.Binding;
import groovy.sql.Sql;
import groovy.util.GroovyScriptEngine;
import groovy.util.ResourceException;
import groovy.util.ScriptException;

import java.io.IOException;
import java.sql.SQLException;

import javax.sql.DataSource;

import org.asteriskjava.fastagi.AgiChannel;
import org.asteriskjava.fastagi.AgiException;
import org.asteriskjava.fastagi.AgiRequest;
import org.asteriskjava.fastagi.AgiScript;

public class PbxAgi implements AgiScript {
    private GroovyScriptEngine gse;
    private Sql db;
    private DataSource dataSource;

    private String scriptsLocation = null;
    
    public PbxAgi() throws IOException
    {
    	
    }
    
    public PbxAgi(String url, String username, String password, 
    	   String driver, String scriptsLocation) throws IOException
    {
    	System.out.println("INITIALIZING PBX-AGI");
    	try {
			db = Sql.newInstance(url, username, password, driver);

			
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
        
		System.out.println("blank");
    	String[] roots = new String[] { scriptsLocation };
        this.gse = new GroovyScriptEngine(roots);
    }

    public void setDataSource(DataSource source)
    {
    	dataSource = source;
    	db = new Sql(dataSource);
    }
    
    public void setScriptsLocation(String location)
    {
    	scriptsLocation = location;
    	try {
			this.gse = new GroovyScriptEngine(scriptsLocation);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }
    
    public void service(AgiRequest request, AgiChannel channel)
            throws AgiException
    {
        String script;
        Binding binding;

        script = request.getScript();
        binding = new Binding();
        binding.setVariable("request", request);
        binding.setVariable("channel", channel);
        binding.setVariable("db", db);
        try
        {
        	System.out.println(script.toString());
            gse.run(script, binding);
        }
        catch (ResourceException e)
        {
            throw new AgiException("Unable to load groovy script '" + script + "'", e);
        }
        catch (ScriptException e)
        {
            throw new AgiException("Exception while running groovy script '" +
                    script + "'", e);
        }
    }
    
//    public void setScriptsLocation(String location) {
//    	scriptsLocation = location;
//    }
}
