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

package org.red5.server.script.groovy;

import groovy.lang.GroovyClassLoader;
import groovy.lang.GroovyObject;
import groovy.lang.Script;

import java.io.IOException;

import org.codehaus.groovy.control.CompilationFailedException;
import org.springframework.beans.factory.BeanClassLoaderAware;
import org.springframework.scripting.ScriptCompilationException;
import org.springframework.scripting.ScriptFactory;
import org.springframework.scripting.ScriptSource;
import org.springframework.scripting.groovy.GroovyObjectCustomizer;
import org.springframework.util.Assert;
import org.springframework.util.ClassUtils;

// TODO: Auto-generated Javadoc
/**
 * {@link org.springframework.scripting.ScriptFactory} implementation
 * for a Groovy script.
 * 
 * <p>Typically used in combination with a
 * {@link org.springframework.scripting.support.ScriptFactoryPostProcessor};
 * see the latter's
 * {@link org.springframework.scripting.support.ScriptFactoryPostProcessor Javadoc}
 * for a configuration example.
 * 
 * @author Juergen Hoeller
 * @author Rob Harrop
 * @since 2.0
 * @see org.springframework.scripting.support.ScriptFactoryPostProcessor
 * @see groovy.lang.GroovyClassLoader
 */
public class GroovyScriptFactory implements ScriptFactory, BeanClassLoaderAware {

	/** The script source locator. */
	private final String scriptSourceLocator;
	
	/** The groovy object customizer. */
	private final GroovyObjectCustomizer groovyObjectCustomizer;

	/** The groovy class loader. */
	private GroovyClassLoader groovyClassLoader = new GroovyClassLoader(ClassUtils.getDefaultClassLoader());

	/** The script class. */
	private Class scriptClass;

	/** The script result class. */
	private Class scriptResultClass;

	/** The script class monitor. */
	private final Object scriptClassMonitor = new Object();

	/** The script interfaces. */
	private Class[] scriptInterfaces;

	/**
	 * Create a new GroovyScriptFactory for the given script source.
	 * <p>We don't need to specify script interfaces here, since
	 * a Groovy script defines its Java interfaces itself.
	 * 
	 * @param scriptSourceLocator a locator that points to the source of the script.
	 * Interpreted by the post-processor that actually creates the script.
	 */
	public GroovyScriptFactory(String scriptSourceLocator) {
		Assert.hasText(scriptSourceLocator, "'scriptSourceLocator' must not be empty");
		this.scriptSourceLocator = scriptSourceLocator;
		this.groovyObjectCustomizer = null;
//		this(scriptSourceLocator, null);
	}

	/**
	 * Create a new GroovyScriptFactory for the given script source,
	 * specifying a strategy interface that can create a custom MetaClass
	 * to supply missing methods and otherwise change the behavior of the object.
	 * <p>We don't need to specify script interfaces here, since
	 * a Groovy script defines its Java interfaces itself.
	 * 
	 * @param scriptSourceLocator a locator that points to the source of the script.
	 * Interpreted by the post-processor that actually creates the script.
	 * @param groovyObjectCustomizer a customizer that can set a custom metaclass
	 * or make other changes to the GroovyObject created by this factory
	 * (may be <code>null</code>)
	 */
	public GroovyScriptFactory(String scriptSourceLocator, GroovyObjectCustomizer groovyObjectCustomizer) {
		Assert.hasText(scriptSourceLocator, "'scriptSourceLocator' must not be empty");
		this.scriptSourceLocator = scriptSourceLocator;
		this.groovyObjectCustomizer = groovyObjectCustomizer;
	}

	/**
	 * Instantiates a new groovy script factory.
	 * 
	 * @param scriptSourceLocator the script source locator
	 * @param scriptInterfaces the script interfaces
	 */
	public GroovyScriptFactory(String scriptSourceLocator, Class[] scriptInterfaces) {
		Assert.hasText(scriptSourceLocator, "'scriptSourceLocator' must not be empty");
		this.scriptSourceLocator = scriptSourceLocator;
		this.groovyObjectCustomizer = null;
		//		this(scriptSourceLocator, null);
		if (null == scriptInterfaces || scriptInterfaces.length < 1) {
			this.scriptInterfaces = new Class[] {};
		} else {
			this.scriptInterfaces = scriptInterfaces;
		}
	}	

	/* (non-Javadoc)
	 * @see org.springframework.beans.factory.BeanClassLoaderAware#setBeanClassLoader(java.lang.ClassLoader)
	 */
	public void setBeanClassLoader(ClassLoader classLoader) {
		this.groovyClassLoader = new GroovyClassLoader(classLoader);
	}

	/* (non-Javadoc)
	 * @see org.springframework.scripting.ScriptFactory#getScriptSourceLocator()
	 */
	public String getScriptSourceLocator() {
		return this.scriptSourceLocator;
	}

	/**
	 * Groovy scripts determine their interfaces themselves,
	 * hence we don't need to explicitly expose interfaces here.
	 * 
	 * @return <code>null</code> always
	 */
	public Class[] getScriptInterfaces() {
		return scriptInterfaces;
	}

	/**
	 * Groovy scripts do not need a config interface,
	 * since they expose their setters as public methods.
	 * 
	 * @return true, if requires config interface
	 */
	public boolean requiresConfigInterface() {
		return false;
	}


	/**
	 * Loads and parses the Groovy script via the GroovyClassLoader.
	 * 
	 * @param scriptSource the script source
	 * @param actualInterfaces the actual interfaces
	 * 
	 * @return the scripted object
	 * 
	 * @throws IOException Signals that an I/O exception has occurred.
	 * @throws ScriptCompilationException the script compilation exception
	 * 
	 * @see groovy.lang.GroovyClassLoader
	 */
	public Object getScriptedObject(ScriptSource scriptSource, Class[] actualInterfaces)
			throws IOException, ScriptCompilationException {

		try {
			Class scriptClassToExecute = null;

			synchronized (this.scriptClassMonitor) {
				if (this.scriptClass == null || scriptSource.isModified()) {
					this.scriptClass = this.groovyClassLoader.parseClass(scriptSource.getScriptAsString());

					if (Script.class.isAssignableFrom(this.scriptClass)) {
						// A Groovy script, probably creating an instance: let's execute it.
						Object result = executeScript(this.scriptClass);
						this.scriptResultClass = (result != null ? result.getClass() : null);
						return result;
					}
					else {
						this.scriptResultClass = this.scriptClass;
					}
				}
				scriptClassToExecute = this.scriptClass;
			}

			// Process re-execution outside of the synchronized block.
			return executeScript(scriptClassToExecute);
		}
		catch (CompilationFailedException ex) {
			throw new ScriptCompilationException(
					"Could not compile Groovy script: " + scriptSource, ex);
		}
	}

	/* (non-Javadoc)
	 * @see org.springframework.scripting.ScriptFactory#getScriptedObjectType(org.springframework.scripting.ScriptSource)
	 */
	public Class getScriptedObjectType(ScriptSource scriptSource)
			throws IOException, ScriptCompilationException {

		synchronized (this.scriptClassMonitor) {
			if (this.scriptClass == null || scriptSource.isModified()) {
				this.scriptClass = this.groovyClassLoader.parseClass(scriptSource.getScriptAsString());

				if (Script.class.isAssignableFrom(this.scriptClass)) {
					// A Groovy script, probably creating an instance: let's execute it.
					Object result = executeScript(this.scriptClass);
					this.scriptResultClass = (result != null ? result.getClass() : null);
				}
				else {
					this.scriptResultClass = this.scriptClass;
				}
			}
			return this.scriptResultClass;
		}
	}

	/**
	 * Instantiate the given Groovy script class and run it if necessary.
	 * 
	 * @param scriptClass the Groovy script class
	 * 
	 * @return the result object (either an instance of the script class
	 * or the result of running the script instance)
	 * 
	 * @throws ScriptCompilationException in case of instantiation failure
	 */
	protected Object executeScript(Class scriptClass) throws ScriptCompilationException {
		try {
			GroovyObject goo = (GroovyObject) scriptClass.newInstance();

			if (this.groovyObjectCustomizer != null) {
				// Allow metaclass and other customization.
				this.groovyObjectCustomizer.customize(goo);
			}

			if (goo instanceof Script) {
				// A Groovy script, probably creating an instance: let's execute it.
				return ((Script) goo).run();
			}
			else {
				// An instance of the scripted class: let's return it as-is.
				return goo;
			}
		}
		catch (InstantiationException ex) {
			throw new ScriptCompilationException(
					"Could not instantiate Groovy script class: " + scriptClass.getName(), ex);
		}
		catch (IllegalAccessException ex) {
			throw new ScriptCompilationException(
					"Could not access Groovy script constructor: " + scriptClass.getName(), ex);
		}
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	public String toString() {
		return "GroovyScriptFactory: script source locator [" + this.scriptSourceLocator + "]";
	}

}
