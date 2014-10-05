package net.oauth;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Collection;
import java.util.Map;

import net.oauth.http.HttpMessage;
import net.oauth.http.HttpMessageDecoder;

public class MessageWithBody extends OAuthMessage {
    private final byte[] body;

    public MessageWithBody(String method, String URL, Collection<OAuth.Parameter> parameters,
                           String contentType, byte[] body) {
        super(method, URL, parameters);
        this.body = body;
        Collection<Map.Entry<String, String>> headers = getHeaders();
        headers.add(new OAuth.Parameter(HttpMessage.ACCEPT_ENCODING, HttpMessageDecoder.ACCEPTED));

        if (body != null) {
            headers.add(new OAuth.Parameter(HttpMessage.CONTENT_LENGTH, String.valueOf(body.length)));
        }
        if (contentType != null) {
            headers.add(new OAuth.Parameter(HttpMessage.CONTENT_TYPE, contentType));
        }
    }

    public InputStream getBodyAsStream() {
        return (body == null) ? null : new ByteArrayInputStream(body);
    }
}
