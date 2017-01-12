'use strict';

Creep.prototype.tick = function() {
   this.tickRole();
}

Creep.prototype.tickRole = function() {
   let t = this;

   if (!this.spawning) {
      let mem = this.memory;

      let role = mem.role;

      if (role) {
         let objrole = Role.getRoleObjectFromRole(role);

         if (objrole.tick) {
            objrole.tick(t);
         }
         else {
            Log.line(creep.name + " can not find an object role for role: " + role);
         }
      }
   }
}

Creep.prototype.isCarryEmpty = function() {
   return this.carryAmount() == 0;
}

Creep.prototype.isCarryFull = function() {
   return this.carryAmount() == this.carryCapacity;
}

Creep.prototype.carryAmount = function() {
   return _.sum(this.carry);
}

Creep.prototype.carryLeftToFill = function() {
   return this.carryCapacity - this.carryAmount();
}

require("prototype_creep_ai");