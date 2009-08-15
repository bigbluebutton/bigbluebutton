/*
 *  Copyright 2004-2006 Stefan Reuter
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
package org.asteriskjava.manager.internal;

import java.util.Map;

import org.asteriskjava.manager.response.ManagerResponse;


/**
 * Transforms maps of attributes to instances of ManagerResponse.
 *
 * @author srt
 * @version $Id: ResponseBuilder.java 1154 2008-08-24 02:05:26Z srt $
 * @see org.asteriskjava.manager.response.ManagerResponse
 */
interface ResponseBuilder
{
    /**
     * Constructs an instance of ManagerResponse based on a map of attributes.
     *
     * @param responseClass the expected subclass of ManagerResponse.
     * @param attributes    the attributes and their values. The keys of this map must be all lower
     *                      case.
     * @return the response with the given attributes.
     */
    ManagerResponse buildResponse(Class<? extends ManagerResponse> responseClass, Map<String, Object> attributes);
}
