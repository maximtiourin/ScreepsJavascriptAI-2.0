'use strict';

Creep.prototype.tick = function() {
   this.tickRole();
}

Creep.prototype.tickRole = function() {
   if (!this.spawning) {
      let mem = this.memory;

      let role = mem.role;

      if (role) {
         let objrole = Role.getRoleObjectFromRole(role);

         objrole.tick();
      }
   }
}