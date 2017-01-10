global.Role = {};

/*
 * Returns the role object that has the given role
 */
Role.getRoleObjectFromRole = function(role) {
   if (role === Role.Sourcer.ROLE) {
      return Role.Sourcer;
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