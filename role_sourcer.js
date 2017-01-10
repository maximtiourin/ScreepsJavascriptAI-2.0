'use strict';

/*
 * The sourcer is responsible for mining from a source node and dropping mined energy on top of itself.
 * In the beginning levels, a sourcer will have a carry component in order to bring source back to spawn
 * to facilitate faster startup. Once a container is built on top of the sourcer mining position, sourcers will stop
 * spawning with carry components entirely.
 */

Role.Sourcer = {}

Role.Sourcer.tick = function(creep) {
   let room = creep.memory.assignedRoom;

   if (room) {

   }
}

/*
 * Returns the config object
 */
Role.Sourcer.bodyConfig = function() {
   let config = [
      {"part": WORK, "min": 2, "max": 5},
      {"part": CARRY, "min": 1},
      {"part": MOVE, "min": 1}
   ];

   return config;
}

/*
 * Returns the minimum amount of energy the room should have available
 * in order to spawn this creep based on the room controller level
 */
Role.Sourcer.minSpawnEnergy = function(rcl) {
   return 300;
}

Role.Sourcer.ROLE = "sourcer";
Role.Sourcer.BASE_NAME = "S:";

