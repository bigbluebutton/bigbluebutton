/*
 * Copyright 2002-2006 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.red5.server.script.rhino;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scripting.ScriptCompilationException;
import org.springframework.scripting.ScriptFactory;
import org.springframework.scripting.ScriptSource;
import org.springframework.util.Assert;

// TODO: Auto-generated Javadoc
/**
 * {@link org.springframework.scripting.ScriptFactory} implementation for a
 * Rhino / Javascript script.
 * 
 * <p>
 * Typically used in combination with a
 * {@link org.springframework.scripting.support.ScriptFactoryPostProcessor};
 * see the latter's
 * {@link org.springframework.scripting.support.ScriptFactoryPostProcessor Javadoc}
 * for a configuration example.
 * 
 * @author Paul Gregoire
 * @since 0.6
 * @see org.springframework.scripting.support.ScriptFactoryPostProcessor
 * @see RhinoScriptUtils
 */
public class RhinoScriptFactory implements ScriptFactory {

	/** The log. */
	static Logger log = LoggerFactory.getLogger(RhinoScriptFactory.class);

	/** The script source locator. */
	private final String scriptSourceLocator;

	/** The script interfaces. */
	private final Class[] scriptInterfaces;

	/** The extended class. */
	private final Class extendedClass;

	/**
	 * Instantiates a new rhino script factory.
	 * 
	 * @param scriptSourceLocator the script source locator
	 */
	public RhinoScriptFactory(String scriptSourceLocator) {
		Assert.hasText(scriptSourceLocator);
		this.scriptSourceLocator = scriptSourceLocator;
		this.scriptInterfaces = new Class[] {};
		this.extendedClass = null;
	}

	/**
	 * Instantiates a new rhino script factory.
	 * 
	 * @param scriptSourceLocator the script source locator
	 * @param scriptInterface the script interface
	 */
	public RhinoScriptFactory(String scriptSourceLocator, Class scriptInterface) {
		Assert.hasText(scriptSourceLocator);
		this.scriptSourceLocator = scriptSourceLocator;
		this.extendedClass = null;
		if (null == scriptInterface) {
			this.scriptInterfaces = new Class[] {};
		} else {
			this.scriptInterfaces = new Class[] { scriptInterface };
		}
	}

	/**
	 * Create a new RhinoScriptFactory for the given script source.
	 * 
	 * @param scriptSourceLocator a locator that points to the source of the script. Interpreted
	 * by the post-processor that actually creates the script.
	 * @param scriptInterfaces the Java interfaces that the scripted object is supposed to
	 * implement
	 * 
	 * @throws IllegalArgumentException if either of the supplied arguments is <code>null</code>;
	 * or the supplied <code>scriptSourceLocator</code> argument
	 * is composed wholly of whitespace; or if the supplied
	 * <code>scriptInterfaces</code> argument array has no
	 * elements
	 */
	public RhinoScriptFactory(String scriptSourceLocator,
			Class[] scriptInterfaces) {
		Assert.hasText(scriptSourceLocator);
		this.scriptSourceLocator = scriptSourceLocator;
		this.extendedClass = null;
		if (null == scriptInterfaces || scriptInterfaces.length < 1) {
			this.scriptInterfaces = new Class[] {};
		} else {
			this.scriptInterfaces = scriptInterfaces;
		}
	}

	/**
	 * Instantiates a new rhino script factory.
	 * 
	 * @param scriptSourceLocator the script source locator
	 * @param scriptInterfaces the script interfaces
	 * @param extendedClass the extended class
	 */
	public RhinoScriptFactory(String scriptSourceLocator,
			Class[] scriptInterfaces, Class extendedClass) {
		Assert.hasText(scriptSourceLocator);
		Assert.notNull(extendedClass);
		this.scriptSourceLocator = scriptSourceLocator;
		this.extendedClass = extendedClass;
		if (null == scriptInterfaces || scriptInterfaces.length < 1) {
			this.scriptInterfaces = new Class[] {};
		} else {
			this.scriptInterfaces = scriptInterfaces;
		}
	}

	/** {@inheritDoc} */
    public String getScriptSourceLocator() {
		return this.scriptSourceLocator;
	}

	/** {@inheritDoc} */
    public Class[] getScriptInterfaces() {
		return this.scriptInterfaces;
	}

	/**
	 * Rhino scripts do not require a config interface.
	 * 
	 * @return <code>false</code> always
	 */
	public boolean requiresConfigInterface() {
		return false;
	}

	/**
	 * Load and parse the Rhino script via RhinoScriptUtils.
	 * 
	 * @param actualScriptSource the actual script source
	 * @param actualInterfaces the actual interfaces
	 * 
	 * @return the scripted object
	 * 
	 * @throws IOException Signals that an I/O exception has occurred.
	 * @throws ScriptCompilationException the script compilation exception
	 * 
	 * @see RhinoScriptUtils#createRhinoObject(String, Class[])
	 */
	public Object getScriptedObject(ScriptSource actualScriptSource,
			Class[] actualInterfaces) throws IOException,
			ScriptCompilationException {
		log.debug("Getting scripted object...");
		try {
			return RhinoScriptUtils.createRhinoObject(actualScriptSource
					.getScriptAsString(), actualInterfaces, extendedClass);
		} catch (Exception ex) {
			throw new ScriptCompilationException(
					"Could not compile Rhino script: " + actualScriptSource, ex);
		}
	}

	/* (non-Javadoc)
	 * @see org.springframework.scripting.ScriptFactory#getScriptedObjectType(org.springframework.scripting.ScriptSource)
	 */
	public Class getScriptedObjectType(ScriptSource arg0) throws IOException, ScriptCompilationException {
		// TODO Auto-generated method stub
		return null;
	}

}
