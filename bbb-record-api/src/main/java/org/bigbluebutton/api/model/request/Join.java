package org.bigbluebutton.api.model.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.validation.annotation.Validated;

import java.util.Objects;

@Validated
@Data
public class Join {

  @JsonProperty("userId")
  private String userId = null;

  @JsonProperty("fullName")
  private String fullName = null;

  @JsonProperty("password")
  private String password = null;

  @JsonProperty("guest")
  private Boolean guest = null;

  @JsonProperty("auth")
  private Boolean auth = null;

  @JsonProperty("createTime")
  private Long createTime = null;

  public Join userId(String userId) {
    this.userId = userId;
    return this;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Join join = (Join) o;
    return Objects.equals(this.userId, join.userId) &&
        Objects.equals(this.fullName, join.fullName) &&
        Objects.equals(this.password, join.password) &&
        Objects.equals(this.guest, join.guest) &&
        Objects.equals(this.auth, join.auth) &&
        Objects.equals(this.createTime, join.createTime);
  }

  @Override
  public int hashCode() {
    return Objects.hash(userId, fullName, password, guest, auth, createTime);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Join {\n");
    
    sb.append("    userId: ").append(toIndentedString(userId)).append("\n");
    sb.append("    fullName: ").append(toIndentedString(fullName)).append("\n");
    sb.append("    password: ").append(toIndentedString(password)).append("\n");
    sb.append("    guest: ").append(toIndentedString(guest)).append("\n");
    sb.append("    auth: ").append(toIndentedString(auth)).append("\n");
    sb.append("    createTime: ").append(toIndentedString(createTime)).append("\n");
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
