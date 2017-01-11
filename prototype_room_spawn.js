'use strict';

/*
 * Adds functions for spawning creeps into owned rooms based on need, and possibly storing stats
 * on the spawning.
 */

/*
 * Look through this room's spawn queue and spawn some creeps by finding
 * an available spawner, if any
 */
Room.prototype.spawnCreeps = function() {
   let mem = this.memory;

   let queue = mem.spawnQueue;
   let qindex = 0;  

   //Loop through all spawns in the room and try to spawn a creep for each of them
   if (queue && queue.length > 0) {
      let spawns = this.find(FIND_MY_SPAWNS);
      if (spawns.length > 0) {
         for (let spawn of spawns) {
            if (!spawn.spawning) {
               if (qindex < queue.length) {
                  let qcreep = queue[qindex];

                  let name = FZ_.GUID.Creep.generate(Role.getBaseNameFromRole(qcreep.role));

                  if (spawn.canCreateCreep(qcreep.bodyConfig.body, name) == OK) {
                     Log.line("Spawning Creep (" + name + ") :: [c = " + qcreep.bodyConfig.cost + "]", this.name);
                     spawn.createCreep(qcreep.bodyConfig.body, name, qcreep.opts);
                     qindex++;
                  }
               }
            }
         }
      }

      //If we spawned any creeps, remove them from the queue
      if (qindex > 0) {
         if (qindex >= queue.length) {
            //Empty queue
            mem.spawnQueue = [];
         }
         else {
            //Slice queue
            mem.spawnQueue = _.slice(queue, qindex);
         }
      }
   }
}

/*
 * Adds a creep-description-object to this rooms spawn queue
 *
 * memoryOpts is an object that contains keys/values that should be stored in
 * the spawned creep's memory object
 */
Room.prototype.addToSpawnQueue = function(role, bodyConfig, memoryOpts = {}) {
   let mem = this.memory;

   Log.line("Queueing Creep (" + role + ") :: [c = " + bodyConfig.cost + "]", this.name);

   mem.spawnQueue.push({"role": role, "bodyConfig": bodyConfig, "opts": memoryOpts});
}

/*
 * Look through creeps assigned to this room, and creeps in the spawn queue,
 * and determine if we need to add more creeps to the queue.
 *
 * Returns out of the function as soon as a single creep is added to the spawn queue
 * so that creeps are queued together according to their priority from top to bottom,
 * and so that heavy calculations aren't done more than they are needed.
 */
Room.prototype.manageSpawnQueue = function() { 
   let t = this;
   let mem = this.memory;
   let controller = this.controller;

   let creepsReal = FZ_.List.Creeps.assignedToRoom(this.name);
   let creepsQueued = _.map(mem.spawnQueue, function(element) {
      //Creates a fake creep object with only the properties we care about
      let obj = {
         memory: {
            role: element.role,
            assignedRoom: t.name
         }
      };

      for (let key in element.opts) {
         obj.memory[key] = element.opts[key];
      }

      return obj;
   });

   //Combine real and queued creeps into one array
   let creeps = FZ_.Array.concat(creepsReal, creepsQueued);

   //Group creeps by their role
   let creepsByRole = FZ_.Group.Creeps.byRole(creeps);

   let objrole = undefined;
   let rolecreeps = undefined;

   /* Manage Sourcer */
   objrole = Role.Sourcer;

   //Get the source objects from memory
   let tSources = mem.survey.sources;

   if (tSources) {
      rolecreeps = creepsByRole[objrole.ROLE];

      //Get a sorted (by cost) array of unassigned Source objects that contains their id, cost, and their sourcePoint (the point from which the source should be mined)
      let freeSources = _.map(tSources, function(tSource, key) {
         let spath = mem.survey.sourcePaths[key];
         let cost = spath.cost;
         let sp = spath.sourcePoint;
         return {"id": key, "cost": cost, "sourcePoint": sp};
      });
      freeSources = _.filter(freeSources, function(tSource) {
         return !_.some(rolecreeps, function(creep) {
            creep.memory.assignedSource.id === tSource.id;
         });
      });
      freeSources = _.sortBy(freeSources, function(tSource) {
         return tSource.cost;
      });

      if (freeSources.length > 0) {
         let freeSource = freeSources[0];

         let minSpawnEnergy = objrole.minSpawnEnergy(controller.level);

         if (this.energyAvailable >= minSpawnEnergy) {
            //Add to spawn queue
            let bodyConfig = FZ_.Calculate.Creep.optimalBodyConfig(objrole.bodyConfig(), this.energyAvailable);

            this.addToSpawnQueue(objrole.ROLE, bodyConfig, {
               assignedSource: {"id": freeSource.id, "sourcePoint": freeSource.sourcePoint}
            });
         }
      }
   }
}