/*
 * Copyright 2004-2005 the original author.
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
package org.red5.server.pooling;

import java.lang.reflect.InvocationTargetException;

import org.apache.commons.beanutils.MethodUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * The Class Worker.
 */
public class Worker implements Runnable {

	/** The log. */
	private static Logger log = LoggerFactory.getLogger(Worker.class);

	/** The class name where the method to be execute is defined. */
	private String className;

	/** The method name to be executed. */
	private String methodName;

	/** The parameters to be passed for the method. */
	private Object[] methodParams;

	/** The parameter types for the respective parameters.. */
	private Class<?>[] paramTypes;

	/** The result of our execution. */
	private Object result;

	/**
	 * Sets the result.
	 * 
	 * @param result The result to set.
	 */
	public void setResult(Object result) {
		this.result = result;
	}

	/**
	 * Gets the result.
	 * 
	 * @return Returns the result.
	 */
	public Object getResult() {
		return result;
	}

	/**
	 * Gets the class name.
	 * 
	 * @return Returns the className.
	 */
	public String getClassName() {
		return className;
	}

	/**
	 * Sets the class name.
	 * 
	 * @param className The className to set.
	 */
	public void setClassName(String className) {
		this.className = className;
	}

	/**
	 * Gets the method name.
	 * 
	 * @return Returns the methodName.
	 */
	public String getMethodName() {
		return methodName;
	}

	/**
	 * Sets the method name.
	 * 
	 * @param methodName The methodName to set.
	 */
	public void setMethodName(String methodName) {
		this.methodName = methodName;
	}

	/**
	 * Gets the method params.
	 * 
	 * @return Returns the methodParams.
	 */
	public Object[] getMethodParams() {
		return methodParams;
	}

	/**
	 * Sets the method params.
	 * 
	 * @param methodParams The methodParams to set.
	 */
	public void setMethodParams(Object[] methodParams) {
		this.methodParams = methodParams;
	}

	/**
	 * Gets the param types.
	 * 
	 * @return Returns the paramTypes.
	 */
	public Class<?>[] getParamTypes() {
		return paramTypes;
	}

	/**
	 * Sets the param types.
	 * 
	 * @param paramTypes The paramTypes to set.
	 */
	public void setParamTypes(Class<?>[] paramTypes) {
		this.paramTypes = paramTypes;
	}

	/**
	 * execute.
	 * 
	 * @param clsName the cls name
	 * @param methName the meth name
	 * @param params the params
	 * @param paramTypes the param types
	 * @param synObj the syn obj
	 */
	public synchronized void execute(String clsName, String methName,
			Object[] params, Class<?>[] paramTypes, Object synObj) {
		this.className = clsName;
		this.methodName = methName;
		this.methodParams = params;
		this.paramTypes = paramTypes;
	}

	/** {@inheritDoc} */
	/*
	 * (non-Javadoc)
	 * 
	 * @see java.lang.Runnable#run()
	 */
	public void run() {
		try {
			Class<?> cls = getClass(this.getClassName());
			Object obj = cls.newInstance();
			this.result = MethodUtils.invokeExactMethod(obj, this
					.getMethodName(), this.getMethodParams(), this
					.getParamTypes());
			if (log.isDebugEnabled()) {
				log.debug(" #### Execution Result = " + result + " for : "
						+ this);
			}
		} catch (ClassNotFoundException e) {
			log.error("ClassNotFoundException - " + e);
		} catch (NoSuchMethodException e) {
			log.error("NoSuchMethodException - " + e);
		} catch (IllegalAccessException e) {
			log.error("IllegalAccessException - " + e);
		} catch (InvocationTargetException e) {
			log.error("InvocationTargetException - " + e);
		} catch (InstantiationException e) {
			log.error("InstantiationException - " + e);
		}
	}

	/**
	 * reset the members to service next request.
	 */
	public void reset() {
		this.className = null;
		this.methodName = null;
		this.methodParams = null;
		this.paramTypes = null;
	}

	/**
	 * getClass.
	 * 
	 * @param cls the cls
	 * 
	 * @return Class
	 * 
	 * @throws ClassNotFoundException the class not found exception
	 */
	private static Class<?> getClass(String cls) throws ClassNotFoundException {
		ClassLoader classLoader = Thread.currentThread()
				.getContextClassLoader();
		if (classLoader == null) {
			classLoader = Worker.class.getClassLoader();
		}
		return classLoader.loadClass(cls);
	}

}
