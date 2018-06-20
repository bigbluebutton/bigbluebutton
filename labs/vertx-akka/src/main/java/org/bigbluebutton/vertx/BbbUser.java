package org.bigbluebutton.vertx;

import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.auth.AbstractUser;
import io.vertx.ext.auth.AuthProvider;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.core.Future;

public class BbbUser extends AbstractUser {
  private static final Logger log = LoggerFactory.getLogger(BbbUser.class);

  private JsonObject jwtToken;
  private JsonArray permissions;
   
  public BbbUser(JsonObject jwtToken, JsonArray permissions) {
    this.jwtToken = jwtToken;
    this.permissions = permissions;
  }

  
  @Override
  public JsonObject principal() {
    return jwtToken;
  }

  @Override
  public void setAuthProvider(AuthProvider arg0) {
    // NOOP - JWT tokens are self contained :)  
  }

  @Override
  protected void doIsPermitted(String permission, Handler<AsyncResult<Boolean>> handler) {
    if (permissions != null) {
      for (Object jwtPermission : permissions) {
        if (permission.equals(jwtPermission)) {
          handler.handle(Future.succeededFuture(true));
          return;
        }
      }
    }

    log.debug("User has no permission [" + permission + "]");
    handler.handle(Future.succeededFuture(false));
  }

}
