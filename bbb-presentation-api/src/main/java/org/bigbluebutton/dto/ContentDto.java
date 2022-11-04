package org.bigbluebutton.dto;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

import java.util.List;

public class ContentDto {

    @JacksonXmlProperty(isAttribute = true)
    private int count;

    @JacksonXmlProperty(localName = "item")
    private List<ItemDto> items;

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public List<ItemDto> getItems() {
        return items;
    }

    public void setItems(List<ItemDto> items) {
        this.items = items;
    }
}
