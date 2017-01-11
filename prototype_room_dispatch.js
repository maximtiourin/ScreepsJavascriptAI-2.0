'use strict';

/*
 * Room dispatch functions handle keep room memory up to date with the dispatching needs of the room
 * EX: At the very start of a room, sourcers are the first thing to spawn. Normally sourcer should just sit
 * on their source point and mine forever, however, at the beginning they should act as refuelers, mining and then
 * refueling the spawn until the room can build its own builders and refuelers to take over, then the sourcer should know
 * to go and mine forever.
 */

Room.prototype.manageDispatching = function() {
   let t = this;
   let DISPATCH_SOURCER_TICKS = 5; //Dispatch sourcers every 5 ticks

   //Sourcer
   FZ_.staggerOperation(DISPATCH_SOURCER_TICKS, function() { t.dispatchSourcer() });
}

/*
 * Checks to see if the proper amount of builders and refuelers are alive,
 * and manages the sourcer dispatch accordingly
 */
Room.prototype.dispatchSourcer = function() {
   let creepsAssigned = FZ_.List.Creeps.assignedToRoom(this.name);
   let creepsByRole = FZ_.Group.Creeps.byRole(creepsAssigned);

   let builders = creepsByRole[Role.Builder.ROLE];
   let refuelers = creepsByRole[Role.Refueler.ROLE];

   if (builders && refuelers && builders.length >= Role.Builder.MIN_COUNT && refuelers.length >= Role.Refueler.MIN_COUNT) {
      //Dispatch sourcer to mine energy on top of its source point
      this.setDispatch("sourcer", "specialized", false);
   }
   else {
      //Dispatch sourcer to refuel to create more builders/refuelers
      this.setDispatch("sourcer", "specialized", true);
   }
}

/*
 * Check the dispatch memory for the key and subkey, returning its value, or
 * undefined if any of it hasnt been initialized yet
 */
Room.prototype.getDispatch = function(key, subkey) {
   let mem = this.memory.dispatch;

   if (!mem) {
      return undefined;
   }
   else if (!key && !mem.subkey) {
      return undefined;
   }
   else if (key && !mem.key) {
      return undefined
   }
   else if (!mem.key[subkey]) {
      return undefined;
   }
   else {
      return mem.key[subkey];
   }
}

/*
 * Sets the dispatch at the key.subkey equal to value, ensuring that both fields exist
 * if necessary
 *
 * If setting dispatch in root.dispatch memory, allow key to be undefined
 */
Room.prototype.setDispatch = function(key, subkey, value) {
   let mem = this.memory;

   if (!mem.dispatch) {
      mem.dispatch = {}
   }

   if (key && !mem.dispatch.key) {
      mem.dispatch.key = {}
   }
   else if (key) {
      mem.dispatch.key[subkey] = value;
   }
   else {
      mem.dispatch[subkey] = value;
   }
}