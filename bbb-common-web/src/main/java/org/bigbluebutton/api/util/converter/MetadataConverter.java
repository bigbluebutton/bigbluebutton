package org.bigbluebutton.api.util.converter;

import com.thoughtworks.xstream.converters.Converter;
import com.thoughtworks.xstream.converters.MarshallingContext;
import com.thoughtworks.xstream.converters.UnmarshallingContext;
import com.thoughtworks.xstream.io.HierarchicalStreamReader;
import com.thoughtworks.xstream.io.HierarchicalStreamWriter;
import org.bigbluebutton.api.model.entity.Metadata;

public class MetadataConverter implements Converter {

    public boolean canConvert(Class clazz) {
        return clazz.equals(Metadata.class);
    }

    public void marshal(Object value, HierarchicalStreamWriter writer, MarshallingContext context) {
        Metadata metadata = (Metadata) value;

        writer.startNode(metadata.getKey());
        writer.setValue(metadata.getValue());
        writer.endNode();
    }

    public Object unmarshal(HierarchicalStreamReader reader, UnmarshallingContext context) {
        Metadata metadata = new Metadata();
        reader.moveDown();
        metadata.setKey(reader.getNodeName());
        metadata.setValue(reader.getValue());
        reader.moveUp();
        return metadata;
    }
}
