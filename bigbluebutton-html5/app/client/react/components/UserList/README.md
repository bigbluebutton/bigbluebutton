# TODO
- [x] Migrate user lock status, currently is just a dummy boolean.

###### These are currently on the UserListContainer but should be in a service or something similar. We need to decide what to do.
- [ ] Migrate set presenter functionality to a service.
- [ ] Migrate kick user functionality to a service.
- [ ] Migrate open private chat to a service.
- [ ] Migrate user lock settings to a service.

# Know Issues

 1. For an unknown reason the chats in session `getSession('chats')` does not populate correctly when the (user_list) blaze template is not rendered. This causes that the badges for unread messages never appear.
 2. Cascade animation missing on mobile sidebar.
