/*
 * Copyright (C) 2014 Samuel Audet
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

import java.io.File;

/**
 *
 * @author Samuel Audet
 */
class Token implements Comparable<Token> {
    Token() { }
    Token(int type, String value) { this.type = type; this.value = value; }
    Token(Token t) {
        file = t.file;
        lineNumber = t.lineNumber;
        type = t.type;
        spacing = t.spacing;
        value = t.value;
    }

    static final int
            INTEGER    = 1,
            FLOAT      = 2,
            STRING     = 3,
            COMMENT    = 4,
            IDENTIFIER = 5,
            SYMBOL     = 6;

    static final Token
            EOF       = new Token(),
            CONST     = new Token(IDENTIFIER, "const"),
            CONSTEXPR = new Token(IDENTIFIER, "constexpr"),
            DEFAULT   = new Token(IDENTIFIER, "default"),
            DEFINE    = new Token(IDENTIFIER, "define"),
            IF        = new Token(IDENTIFIER, "if"),
            IFDEF     = new Token(IDENTIFIER, "ifdef"),
            IFNDEF    = new Token(IDENTIFIER, "ifndef"),
            ELIF      = new Token(IDENTIFIER, "elif"),
            ELSE      = new Token(IDENTIFIER, "else"),
            ENDIF     = new Token(IDENTIFIER, "endif"),
            ENUM      = new Token(IDENTIFIER, "enum"),
            EXPLICIT  = new Token(IDENTIFIER, "explicit"),
            EXTERN    = new Token(IDENTIFIER, "extern"),
            FRIEND    = new Token(IDENTIFIER, "friend"),
            INLINE    = new Token(IDENTIFIER, "inline"),
            STATIC    = new Token(IDENTIFIER, "static"),
            CLASS     = new Token(IDENTIFIER, "class"),
            INTERFACE = new Token(IDENTIFIER, "interface"),
            __INTERFACE = new Token(IDENTIFIER, "__interface"),
            STRUCT    = new Token(IDENTIFIER, "struct"),
            UNION     = new Token(IDENTIFIER, "union"),
            TEMPLATE  = new Token(IDENTIFIER, "template"),
            TYPEDEF   = new Token(IDENTIFIER, "typedef"),
            TYPENAME  = new Token(IDENTIFIER, "typename"),
            USING     = new Token(IDENTIFIER, "using"),
            NAMESPACE = new Token(IDENTIFIER, "namespace"),
            NEW       = new Token(IDENTIFIER, "new"),
            DELETE    = new Token(IDENTIFIER, "delete"),
            OPERATOR  = new Token(IDENTIFIER, "operator"),
            PRIVATE   = new Token(IDENTIFIER, "private"),
            PROTECTED = new Token(IDENTIFIER, "protected"),
            PUBLIC    = new Token(IDENTIFIER, "public"),
            VIRTUAL   = new Token(IDENTIFIER, "virtual");

    File file = null;
    int lineNumber = 0, type = -1;
    String spacing = "", value = "";

    boolean match(Object ... tokens) {
        boolean found = false;
        for (Object t : tokens) {
            found = found || equals(t);
        }
        return found;
    }

    Token expect(Object ... tokens) throws ParserException {
        if (!match(tokens)) {
            throw new ParserException(file + ":" + lineNumber + ": Unexpected token '" + toString() + "'");
        }
        return this;
    }

    boolean isEmpty() {
        return type == -1 && spacing.isEmpty();
    }

    @Override public boolean equals(Object obj) {
        if (obj == this) {
            return true;
        } else if (obj == null) {
            return false;
        } else if (obj.getClass() == Integer.class) {
            return type == (Integer)obj;
        } else if (obj.getClass() == Character.class) {
            return type == (Character)obj;
        } else if (obj.getClass() == String.class) {
            return obj.equals(value);
        } else if (obj.getClass() == getClass()) {
            Token other = (Token)obj;
            return type == other.type && ((value == null && other.value == null) ||
                                           value != null && value.equals(other.value));
        } else {
            return false;
        }
    }

    @Override public int hashCode() {
        return type;
    }

    @Override public String toString() {
        return value != null && value.length() > 0 ? value : String.valueOf((char)type);
    }

    public int compareTo(Token t) {
        return toString().compareTo(t.toString());
    }
}
