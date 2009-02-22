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
    	
    public void setDataSource(DataSource source) {
    	dataSource = source;
    	db = new Sql(dataSource);
    }
    
    public PbxAgi() throws IOException
    {               
    	String[] roots = new String[] { "agi/scripts/" };
    	
    	// Pass in the classloader so the scripts will be able to find the classes
    	// it imports.
        this.gse = new GroovyScriptEngine(roots, this.getClass().getClassLoader());
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
        	System.out.println("Executing " + script.toString());
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
}
