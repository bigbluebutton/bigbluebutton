# TODO
- [x] Migrate user lock status, currently is just a dummy boolean.
- [x] Migrate set presenter functionality to a service.
- [x] Migrate kick user functionality to a service.
- [x] Migrate open private chat to a service.
- [x] Migrate user lock settings to a service.

# Known Issues

 1. For an unknown reason the chats in session `getSession('chats')` does not populate correctly when the (user_list) blaze template is not rendered. This causes that the badges for unread messages never appear.
 2. Cascade animation missing on mobile sidebar.
