'use strict'

Room.prototype.tick = function() {
   let t = this;
   let MANAGE_SPAWN_QUEUE_TICKS = 10; //Manage the spawn queue every 5 ticks

   //Init
   this.init();

   //Survey
   this.survey();

   //Spawn
   FZ_.staggerOperation(MANAGE_SPAWN_QUEUE_TICKS, function() { t.manageSpawnQueue() });
   this.spawnCreeps();

   //Dispatch
   this.manageDispatching();
}

Room.prototype.init = function() {
   if (!this.isInitialized()) {
      let mem = this.memory;

      //Create spawn queue
      mem.spawnQueue = [];

      //Set owned room
      if (!Memory.ownedRooms) {
         Memory.ownedRooms = {};
      }
      Memory.ownedRooms[this.name] = {};
   }
}

Room.prototype.isInitialized = function() {
   return Memory.ownedRooms && Memory.ownedRooms[this.name];
}

require("prototype_room_spawn");
require("prototype_room_survey");
require("prototype_room_dispatch");