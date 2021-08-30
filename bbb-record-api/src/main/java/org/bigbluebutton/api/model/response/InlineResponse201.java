package org.bigbluebutton.api.model.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;

import javax.validation.Valid;
import java.util.Objects;

/**
 * InlineResponse201
 */
@Validated
@javax.annotation.Generated(value = "io.swagger.codegen.v3.generators.java.SpringCodegen", date = "2021-08-12T14:50:05.965Z[GMT]")


public class InlineResponse201   {
  @JsonProperty("payload")
  private InlineResponse201Payload payload = null;

  @JsonProperty("errors")
  private Object errors = null;

  public InlineResponse201 payload(InlineResponse201Payload payload) {
    this.payload = payload;
    return this;
  }

  /**
   * Get payload
   * @return payload
   **/
  @Schema(description = "")
  
    @Valid
    public InlineResponse201Payload getPayload() {
    return payload;
  }

  public void setPayload(InlineResponse201Payload payload) {
    this.payload = payload;
  }

  public InlineResponse201 errors(Object errors) {
    this.errors = errors;
    return this;
  }

  /**
   * Get errors
   * @return errors
   **/
  @Schema(description = "")
  
    public Object getErrors() {
    return errors;
  }

  public void setErrors(Object errors) {
    this.errors = errors;
  }


  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    InlineResponse201 inlineResponse201 = (InlineResponse201) o;
    return Objects.equals(this.payload, inlineResponse201.payload) &&
        Objects.equals(this.errors, inlineResponse201.errors);
  }

  @Override
  public int hashCode() {
    return Objects.hash(payload, errors);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class InlineResponse201 {\n");
    
    sb.append("    payload: ").append(toIndentedString(payload)).append("\n");
    sb.append("    errors: ").append(toIndentedString(errors)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }
}
