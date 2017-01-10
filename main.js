'use strict';

require('require');

var main = function() {
   let GARBAGE_COLLECTION_TICKS = 100; //Collect garbage every 100 ticks

   //CPU check
   if (Game.cpu.bucket < Game.cpu.tickLimit * 2) {
      console.log('Skipping tick ' + Game.time + ' due to lack of CPU.');
      return;
   }

   //GC
   FZ_.staggerOperation(GARBAGE_COLLECTION_TICKS, function() { GarbageCollector.clearMemory() });

   /*Main logic*/
   //Look through all of my owned rooms (whether or not they have been initialized), and do room operations for the tick
   for (let name in Game.rooms) {
      let room = Game.rooms[name];
      let controller = room.controller;

      if (controller && controller.my) {
         room.tick();
      }
   }

   //Look through all of my creeps, and do creep operations
   for (let name in Game.creeps) {
      let creep = Game.creeps[name];

      creep.tick();
   }
}

module.exports.loop = function() {
   main();
}