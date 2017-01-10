'use strict';

global.GarbageCollector = {};

GarbageCollector.clearMemory = function() {
   for (let creepName in Memory.creeps) {
      if (!Game.creeps[creepName]) {
         delete Memory.creeps[creepName];
      }
   }

   for (let flagName in Memory.flags) {
      if (!Game.flags[flagName]) {
         delete Memory.flags[flagName];
      }
   }
}