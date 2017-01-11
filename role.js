global.Role = {};

/*
 * Returns the role object that has the given role
 */
Role.getRoleObjectFromRole = function(role) {
   if (role === Role.Sourcer.ROLE) {
      return Role.Sourcer;
   }
   else if (role === Role.Builder.ROLE) {
      return Role.Builder;
   }
   else if (role === Role.Refueler.ROLE) {
      return Role.Refueler;
   }

   return {};
}

/*
 * Shortcut method to get the base name of a given role
 */
Role.getBaseNameFromRole = function(role) {
   return Role.getRoleObjectFromRole(role).BASE_NAME;
}

require("role_sourcer");
require("role_builder");
require("role_refueler");