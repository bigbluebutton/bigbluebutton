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
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.Map;
import java.util.regex.PatternSyntaxException;

import javax.script.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scripting.ScriptCompilationException;
import org.springframework.util.ClassUtils;

// TODO: Auto-generated Javadoc
/**
 * Utility methods for handling Rhino / Javascript objects.
 * 
 * @author Paul Gregoire
 * @since 0.6
 */
public class RhinoScriptUtils {

	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger(RhinoScriptUtils.class);

	// ScriptEngine manager
	/** The mgr. */
	private static ScriptEngineManager mgr = new ScriptEngineManager();

	// Javascript wrapper
	/** The Constant jsWrapper. */
	private static final String jsWrapper = "function Wrapper(obj){return new JSAdapter(){ __has__ : function(name){return true;}, __get__ : function(name){if(name in obj){return obj[name];}else if(typeof(obj['doesNotUnderstand']) == 'function'){return function(){return obj.doesNotUnderstand(name, arguments);}}else{return undefined;}}};}";

	/**
	 * Create a new Rhino-scripted object from the given script source.
	 * 
	 * @param scriptSource the script source text
	 * @param interfaces the interfaces that the scripted Java object is supposed to
	 * implement
	 * @param extendedClass the extended class
	 * 
	 * @return the scripted Java object
	 * 
	 * @throws ScriptCompilationException in case of Rhino parsing failure
	 * @throws java.io.IOException 	 * @throws IOException Signals that an I/O exception has occurred.
	 * @throws Exception the exception
	 */
	public static Object createRhinoObject(String scriptSource,
			Class[] interfaces, Class extendedClass)
			throws ScriptCompilationException, IOException, Exception {
		if (log.isDebugEnabled()) {
			log.debug("Script Engine Manager: " + mgr.getClass().getName());
		}
		ScriptEngine engine = mgr.getEngineByExtension("js");
		if (null == engine) {
			log.warn("Javascript is not supported in this build");
		}
		// set engine scope namespace
		Bindings nameSpace = engine.getBindings(ScriptContext.ENGINE_SCOPE);
		// add the logger to the script
		nameSpace.put("log", log);
		// compile the wrapper script
		CompiledScript wrapper = ((Compilable) engine).compile(jsWrapper);
		nameSpace.put("Wrapper", wrapper);

		// get the function name ie. class name / ctor
		String funcName = RhinoScriptUtils.getFunctionName(scriptSource);
		if (log.isDebugEnabled()) {
			log.debug("New script: " + funcName);
		}
		// set the 'filename'
		nameSpace.put(ScriptEngine.FILENAME, funcName);

		if (null != interfaces) {
			nameSpace.put("interfaces", interfaces);
		}

		if (null != extendedClass) {
			if (log.isDebugEnabled()) {
				log.debug("Extended: " + extendedClass.getName());
			}
			nameSpace.put("supa", extendedClass.newInstance());
		}
		//
		// compile the script
		CompiledScript script = ((Compilable) engine).compile(scriptSource);
		// eval the script with the associated namespace
		Object o = null;
		try {
			o = script.eval();
		} catch (Exception e) {
			log.error("Problem evaluating script", e);
		}
		if (log.isDebugEnabled()) {
			log.debug("Result of script call: " + o);
		}
		// script didnt return anything we can use so try the wrapper
		if (null == o) {
			wrapper.eval();
		} else {
			wrapper.eval();
			o = ((Invocable) engine).invokeFunction("Wrapper",
					new Object[] { engine.get(funcName) });
			if (log.isDebugEnabled()) {
				log.debug("Result of invokeFunction: " + o);
			}
		}
		return Proxy.newProxyInstance(ClassUtils.getDefaultClassLoader(),
				interfaces, new RhinoObjectInvocationHandler(engine, o));
	}

	/**
	 * InvocationHandler that invokes a Rhino script method.
	 */
	private static class RhinoObjectInvocationHandler implements
			InvocationHandler {

		/** The engine. */
		private final ScriptEngine engine;

		/** The instance. */
		private final Object instance;

		/**
		 * Instantiates a new rhino object invocation handler.
		 * 
		 * @param engine the engine
		 * @param instance the instance
		 */
		public RhinoObjectInvocationHandler(ScriptEngine engine, Object instance) {
			this.engine = engine;
			this.instance = instance;
		}

		/* (non-Javadoc)
		 * @see java.lang.reflect.InvocationHandler#invoke(java.lang.Object, java.lang.reflect.Method, java.lang.Object[])
		 */
		public Object invoke(Object proxy, Method method, Object[] args)
				throws Throwable {
			Object o = null;
			// ensure a set of args are available
			if (args == null || args.length == 0) {
				args = new Object[] { "" };
			}
			String name = method.getName();
			if (log.isDebugEnabled()) {
				log.debug("Calling: " + name);
			}
			try {
				Method apiMethod = null;
				Invocable invocable = (Invocable) engine;
				if (null == instance) {
					o = invocable.invokeFunction(name, args);
				} else {
					try {
						o = invocable.invokeMethod(instance, name, args);
					} catch (NoSuchMethodException nex) {
						log.debug("Method not found: " + name);
						try {
							// try to invoke it directly, this will work if the
							// function is in the engine context
							// ie. the script has been already evaluated
							o = invocable.invokeFunction(name, args);
						} catch (Exception ex) {
							log.debug("Function not found: " + name);
							Class[] interfaces = (Class[]) engine
									.get("interfaces");
							for (Class clazz : interfaces) {
								// java6 style
								o = invocable.getInterface(engine
										.get((String) engine.get("className")),
										clazz);
								if (null != o) {
									log.debug("Interface return type: "
											+ o.getClass().getName());
									break;
								}
							}
						}
					}
				}
				if (log.isDebugEnabled()) {
					log.debug("Invocable result: " + o);
				}
			} catch (NoSuchMethodException nex) {
				log.warn("Method not found");
			} catch (Throwable t) {
				log.warn("{}", t);
			}
			return o;
		}
	}

	/**
	 * Uses a regex to get the first "function" name, this name is used to
	 * create an instance of the javascript object.
	 * 
	 * @param scriptSource the script source
	 * 
	 * @return the function name
	 */
	private static String getFunctionName(String scriptSource) {
		String ret = "undefined";
		try {
			ret = scriptSource.replaceAll(
					"[\\S\\w\\s]*?function ([\\w]+)\\(\\)[\\S\\w\\s]+", "$1");
			// if undefined then look for the first var
			if (ret.equals("undefined") || ret.length() > 64) {
				ret = scriptSource.replaceAll(
						"[\\S\\w\\s]*?var ([\\w]+)[\\S\\w\\s]+", "$1");
			}
		} catch (PatternSyntaxException ex) {
			log.error("Syntax error in the regular expression");
		} catch (IllegalArgumentException ex) {
			log
					.error("Syntax error in the replacement text (unescaped $ signs?)");
		} catch (IndexOutOfBoundsException ex) {
			log.error("Non-existent backreference used the replacement text");
		}
		log.debug("Got a function name: " + ret);
		return ret;
	}

}
