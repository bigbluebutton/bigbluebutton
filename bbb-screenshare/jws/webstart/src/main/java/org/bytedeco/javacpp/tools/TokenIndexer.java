/*
 * Copyright (C) 2014-2015 Samuel Audet
 *
 * Licensed either under the Apache License, Version 2.0, or (at your option)
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation (subject to the "Classpath" exception),
 * either version 2, or any later version (collectively, the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *     http://www.gnu.org/licenses/
 *     http://www.gnu.org/software/classpath/license.html
 *
 * or as provided in the LICENSE.txt file that accompanied this code.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.bytedeco.javacpp.tools;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 *
 * @author Samuel Audet
 */
class TokenIndexer {
    TokenIndexer(InfoMap infoMap, Token[] array, boolean isCFile) {
        this.infoMap = infoMap;
        this.array = array;
        this.isCFile = isCFile;
    }

    /** Set to true to disable temporarily the preprocessor. */
    boolean raw = false;
    /** The set of {@link Info} objects to use during preprocessing. */
    InfoMap infoMap = null;
    /** The token of array, modified by the preprocessor as we go. */
    Token[] array = null;
    /** The current index, in the array of tokens. Used by {@link #get(int)} and {@link #next()}. */
    int index = 0;
    /** Whether the file came from the C-include path */
    final boolean isCFile;

    Token[] filter(Token[] array, int index) {
        if (index + 1 < array.length && array[index].match('#') &&
                array[index + 1].match(Token.IF, Token.IFDEF, Token.IFNDEF)) {
            // copy the array of tokens up to this point
            List<Token> tokens = new ArrayList<Token>();
            for (int i = 0; i < index; i++) {
                tokens.add(array[i]);
            }
            int count = 0;
            Info info = null;
            boolean define = true, defined = false;
            while (index < array.length) {
                String spacing = array[index].spacing;
                int n = spacing.lastIndexOf('\n') + 1;
                Token keyword = null;
                // pick up #if, #ifdef, #ifndef, #elif, #else, and #endif directives
                if (array[index].match('#')) {
                    if (array[index + 1].match(Token.IF, Token.IFDEF, Token.IFNDEF)) {
                        count++;
                    }
                    if (count == 1 && array[index + 1].match(Token.IF, Token.IFDEF, Token.IFNDEF, Token.ELIF, Token.ELSE, Token.ENDIF)) {
                        keyword = array[index + 1];
                    }
                    if (array[index + 1].match(Token.ENDIF)) {
                        count--;
                    }
                }
                // conditionally fill up the new array of tokens
                if (keyword != null) {
                    index += 2;

                    // keep the directive as comment
                    Token comment = new Token();
                    comment.type = Token.COMMENT;
                    comment.spacing = spacing.substring(0, n);
                    comment.value = "// " + spacing.substring(n) + "#" + keyword.spacing + keyword;
                    tokens.add(comment);

                    String value = "";
                    for ( ; index < array.length; index++) {
                        if (array[index].spacing.indexOf('\n') >= 0) {
                            break;
                        }
                        if (!array[index].match(Token.COMMENT)) {
                            value += array[index].spacing + array[index];
                        }
                        comment.value += array[index].match("\n") ? "\n// "
                                       : array[index].spacing + array[index].toString().replaceAll("\n", "\n// ");
                    }

                    if (keyword.match(Token.IF, Token.IFDEF, Token.IFNDEF, Token.ELIF)) {
                        define = info == null || !defined;
                        info = infoMap.getFirst(value);
                        if (info != null) {
                            define = keyword.match(Token.IFNDEF) ? !info.define : info.define;
                        } else try {
                            define = Integer.parseInt(value.trim()) != 0;
                        } catch (NumberFormatException e) {
                            /* default define */
                        }
                    } else if (keyword.match(Token.ELSE)) {
                        define = info == null || !define;
                    } else if (keyword.match(Token.ENDIF)) {
                        if (count == 0) {
                            break;
                        }
                    }
                } else if (define) {
                    tokens.add(array[index++]);
                } else {
                    index++;
                }
                defined = define || defined;
            }
            // copy the rest of the tokens from this point on
            for ( ; index < array.length; index++) {
                tokens.add(array[index]);
            }
            array = tokens.toArray(new Token[tokens.size()]);
        }
        return array;
    }

    Token[] expand(Token[] array, int index) {
        if (index < array.length && infoMap.containsKey(array[index].value)) {
            // if we hit a token whose info.cppText starts with #define (a macro), expand it
            int startIndex = index;
            Info info = infoMap.getFirst(array[index].value);
            if (info != null && info.cppText != null) {
                try {
                    Tokenizer tokenizer = new Tokenizer(info.cppText);
                    if (!tokenizer.nextToken().match('#')
                            || !tokenizer.nextToken().match(Token.DEFINE)
                            || !tokenizer.nextToken().match(info.cppNames[0])) {
                        return array;
                    }
                    // copy the array of tokens up to this point
                    List<Token> tokens = new ArrayList<Token>();
                    for (int i = 0; i < index; i++) {
                        tokens.add(array[i]);
                    }
                    List<String> params = new ArrayList<String>();
                    List<Token>[] args = null;
                    Token token = tokenizer.nextToken();
                    // pick up the parameters and arguments of the macro if it has any
                    String name = array[index].value;
                    if (token.match('(')) {
                        token = tokenizer.nextToken();
                        while (!token.isEmpty()) {
                            if (token.match(Token.IDENTIFIER)) {
                                params.add(token.value);
                            } else if (token.match(')')) {
                                token = tokenizer.nextToken();
                                break;
                            }
                            token = tokenizer.nextToken();
                        }
                        index++;
                        if (params.size() > 0 && (index >= array.length || !array[index].match('('))) {
                            return array;
                        }
                        name += array[index].spacing + array[index];
                        args = new List[params.size()];
                        int count = 0, count2 = 0;
                        for (index++; index < array.length; index++) {
                            Token token2 = array[index];
                            name += token2.spacing + token2;
                            if (count2 == 0 && token2.match(')')) {
                                break;
                            } else if (count2 == 0 && token2.match(',')) {
                                count++;
                                continue;
                            } else if (token2.match('(','[','{')) {
                                count2++;
                            } else if (token2.match(')',']','}')) {
                                count2--;
                            }
                            if (count < args.length) {
                                if (args[count] == null) {
                                    args[count] = new ArrayList<Token>();
                                }
                                args[count].add(token2);
                            }
                        }
                        // expand the arguments of the macros as well
                        for (int i = 0; i < args.length; i++) {
                            if (infoMap.containsKey(args[i].get(0).value)) {
                                args[i] = Arrays.asList(expand(args[i].toArray(new Token[args[i].size()]), 0));
                            }
                        }
                    }
                    int startToken = tokens.size();
                    // expand the token in question, unless we should skip it
                    info = infoMap.getFirst(name);
                    while ((info == null || !info.skip) && !token.isEmpty()) {
                        boolean foundArg = false;
                        for (int i = 0; i < params.size(); i++) {
                            if (params.get(i).equals(token.value)) {
                                tokens.addAll(args[i]);
                                foundArg = true;
                                break;
                            }
                        }
                        if (!foundArg) {
                            if (token.type == -1) {
                                token.type = Token.COMMENT;
                            }
                            tokens.add(token);
                        }
                        token = tokenizer.nextToken();
                    }
                    // concatenate tokens as required
                    for (int i = startToken; i < tokens.size(); i++) {
                        if (tokens.get(i).match("##") && i > 0 && i + 1 < tokens.size()) {
                            tokens.get(i - 1).value += tokens.get(i + 1).value;
                            tokens.remove(i);
                            tokens.remove(i);
                            i--;
                        }
                    }
                    // copy the rest of the tokens from this point on
                    for (index++; index < array.length; index++) {
                        tokens.add(array[index]);
                    }
                    if ((info == null || !info.skip) && startToken < tokens.size()) {
                        tokens.get(startToken).spacing = array[startIndex].spacing;
                    }
                    array = tokens.toArray(new Token[tokens.size()]);
                } catch (IOException ex) {
                    throw new RuntimeException(ex);
                }
            }
        }
        return array;
    }

    int preprocess(int index, int count) {
        for ( ; index < array.length; index++) {
            Token[] a = null;
            while (a != array) {
                a = array;
                array = filter(array, index); // conditionals
                array = expand(array, index); // macros
            }
            // skip comments
            if (!array[index].match(Token.COMMENT) && --count < 0) {
                break;
            }
        }
        Token[] a = null;
        while (a != array) {
            a = array;
            array = filter(array, index); // conditionals
            array = expand(array, index); // macros
        }
        return index;
    }

    /** Returns {@code get(0)}. */
    Token get() {
        return get(0);
    }
    /** Returns {@code array[index + i]}. After preprocessing if {@code raw == false}. */
    Token get(int i) {
        int k = raw ? index + i : preprocess(index, i);
        return k < array.length ? array[k] : Token.EOF;
    }
    /** Increments {@code index} and returns {@code array[index]}. After preprocessing if {@code raw == false}. */
    Token next() {
        index = raw ? index + 1 : preprocess(index, 1);
        return index < array.length ? array[index] : Token.EOF;
    }
}
