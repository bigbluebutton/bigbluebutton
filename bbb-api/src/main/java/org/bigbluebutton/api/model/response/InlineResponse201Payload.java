package org.bigbluebutton.api.model.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * InlineResponse201Payload
 */
@Validated
@javax.annotation.Generated(value = "io.swagger.codegen.v3.generators.java.SpringCodegen", date = "2021-08-12T14:50:05.965Z[GMT]")


public class InlineResponse201Payload   {
//  @JsonProperty("links")
//  @Valid
//  private List<Link> links = null;
//
//  public InlineResponse201Payload links(List<Link> links) {
//    this.links = links;
//    return this;
//  }
//
//  public InlineResponse201Payload addLinksItem(Link linksItem) {
//    if (this.links == null) {
//      this.links = new ArrayList<Link>();
//    }
//    this.links.add(linksItem);
//    return this;
//  }
//
//  /**
//   * Get links
//   * @return links
//   **/
//  @Schema(description = "")
//      @Valid
//    public List<Link> getLinks() {
//    return links;
//  }
//
//  public void setLinks(List<Link> links) {
//    this.links = links;
//  }
//
//
//  @Override
//  public boolean equals(Object o) {
//    if (this == o) {
//      return true;
//    }
//    if (o == null || getClass() != o.getClass()) {
//      return false;
//    }
//    InlineResponse201Payload inlineResponse201Payload = (InlineResponse201Payload) o;
//    return Objects.equals(this.links, inlineResponse201Payload.links);
//  }
//
//  @Override
//  public int hashCode() {
//    return Objects.hash(links);
//  }
//
//  @Override
//  public String toString() {
//    StringBuilder sb = new StringBuilder();
//    sb.append("class InlineResponse201Payload {\n");
//
//    sb.append("    links: ").append(toIndentedString(links)).append("\n");
//    sb.append("}");
//    return sb.toString();
//  }
//
//  /**
//   * Convert the given object to string with each line indented by 4 spaces
//   * (except the first line).
//   */
//  private String toIndentedString(Object o) {
//    if (o == null) {
//      return "null";
//    }
//    return o.toString().replace("\n", "\n    ");
//  }
}
