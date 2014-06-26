SetCollectionPermissions = function() {

	/*Users.allow({
		'insert': function(userId, doc){
			return userId;
		},
		'update': function(userId, doc, fields, modifier){
			return userId;
		},

	});*/

	/*Meetings.users.allow({
		'insert': function(userId, doc){
			return Roles.userIsInRole(Meteor.user(), ["admin"]);
		},
  		'update': function (userId, doc, fields, modifier) {     
    		return Roles.userIsInRole(Meteor.user(), ["admin"]) && doc.username !== "Admin";
		},
		remove: function(userId, doc) {
			return Roles.userIsInRole(userId, ["admin"]) && doc.username !== "Admin";
		}
	});*/
	return 0;
}
