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

         objrole.tick(this);
      }
   }
}

Creep.prototype.isCarryEmpty = function() {
   return this.carryAmount == 0;
}

Creep.prototype.isCarryFull = function() {
   return this.carryAmount = this.carryCapacity;
}

Creep.prototype.carryAmount = function() {
   return _.sum(this.carry);
}

require("prototype_creep_ai");