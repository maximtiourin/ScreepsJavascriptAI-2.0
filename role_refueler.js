'use strict';

/*
 * A refueler looks for energy in the room, prioritizing based on type of energy and its distance
 * and then uses that energy to refuel the nearest Spawn / Extension, or a tower if neither of those need energy.
 *
 * A refueler will store energy in a 'storage' if it has nowhere else to store energy, but it will never retrieve
 * energy from a storage.
 */

Role.Refueler = {}

Role.Refueler.tick = function(creep) {
   //Register pathfinding rules
   creep.registerPathfindingRules(Role.Refueler.pathfindingRules);

   let mem = creep.memory;

   let roomName = mem.assignedRoom;

   if (roomName) {
      let room = Game.rooms[roomName];

      if (room) {
         let roomMem = room.memory;

         AI.toggleNeedEnergy(creep);

         if (mem.needEnergy) {
            //Collect energy
            //Get a converted list of room withdrawables into objects, and filter them
            let withdrawables = Role.Refueler.getValidWithdrawables(room);

            if (withdrawables.length > 0) {
               //Sort withdrawables by weights
               let sortedWithdrawables = _.sortBy(withdrawables, function(w) {
                  let IGNORE_WEIGHT_TIER = 71; //Diagonal distance of the room, so we can priotize by certain factors before we consider distance

                  let energy = 0;
                  let weight = 0;

                  if (w instanceof Resource && w.resourceType === RESOURCE_ENERGY) {
                     energy = w.amount;
                  }
                  else if (w instanceof Structure) {
                     energy = w.store[RESOURCE_ENERGY];
                     weight += IGNORE_WEIGHT_TIER; //Deprioritize non-dropped energy
                  }

                  if (energy < creep.carryLeftToFill()) {
                     weight += IGNORE_WEIGHT_TIER; //Deprioritize withdrawals that wont fill us
                  }

                  //Sort by distanceSquared
                  weight += FZ_.Math.distanceSquared(creep, w);

                  return weight;
               });

               //Get priority
               let withdrawable = sortedWithdrawables[0];

               //Try to withdraw
               if (withdrawable instanceof Resource) {
                  AI.Pickup.target(creep, withdrawable);
               }
               else if (withdrawable instanceof Structure) {
                  AI.Withdraw.fromTarget(creep, withdrawable, RESOURCE_ENERGY);
               }
            }
         }
         else {
            //Refuel structures
            //Get converted list of room refuelables into objects, and filter them
            let refuelables = Role.Refueler.getValidRefuelables(room);

            if (refuelables.length > 0) {
               let sortedRefuelables = _.sortBy(refuelables, function(r) {
                  let LAST_RESORT = Infinity;

                  let weight = 0;

                  if (w.structureType === STRUCTURE_STORAGE) {
                     weight += LAST_RESORT;
                  }

                  //Sort by distanceSquared
                  weight += FZ_.Math.distanceSquared(creep, r);

                  return weight;
               });

               //Get priority
               let refuelable = sortedRefuelables[0];

               //Try to deposit
               AI.Deposit.inTarget(creep, refuelable, RESOURCE_ENERGY);
            }
         }
      }
   }
}

Role.Refueler.getValidRefuelables = function(room) {
   let roomMem = room.memory;

   let refuelables = [];

   for (let key in roomMem.survey.refuelables.list) {
      let r = roomMem.survey.refuelables[key];

      let obj = Game.getObjectById(r.roomObject);

      if (obj) {
         refuelables.push(obj);
      }
   }

   refuelables = _.filter(refuelables, function(r) {
      if (r instanceof StructureContainer) {
         return false;
      }
      else if (r.storeCapacity && r.getResourceCount() == r.storeCapacity) {
         return false;
      }
      else if (r.energyCapacity && r.energy == r.energyCapacity) {
         return false;
      }
      else {
         return true;
      }
   });

   return refuelables;
}

/*
 * Get withdrawable game objects from the room that exist, and then filter them
 * to exclude storage structure
 */
Role.Refueler.getValidWithdrawables = function(room) {
   let roomMem = room.memory;

   let withdrawables = [];

   for (let key in roomMem.survey.withdrawables.list) {
      let w = roomMem.survey.withdrawables[key];

      let obj = Game.getObjectById(w.roomObject);

      if (obj) {
         withdrawables.push(obj);
      }
   }

   withdrawables = _.filter(withdrawables, function(w) {
      if (w instanceof StructureStorage) {
         return false;
      }
      else if (w instanceof Resource && w.resourceType !== RESOURCE_ENERGY) {
         return false;
      }
      else if (w instanceof Structure && !w.store[RESOURCE_ENERGY]) {
         return false;
      }
      else {
         return true;
      }
   });

   return withdrawables;
}

/*
 * Returns the config object
 */
Role.Refueler.bodyConfig = function() {
   let config = [
      {"part": CARRY, "min": 1},
      {"part": MOVE, "min": 1}
   ];

   return config;
}

/*
 * Returns the minimum amount of energy the room should have available
 * in order to spawn this creep based on the room controller level
 */
Role.Refueler.minSpawnEnergy = function(rcl) {
   return (BODYPART_COST[CARRY]) + (BODYPART_COST[MOVE]);
}

/*
 * Pathfinding rules to use for this role
 */
Role.Refueler.pathfindingRules = {
   ignoreCreeps: true,
   reusePath: 10, //Save paths for 10 ticks
   maxOps: 100, //0.1 CPU max
   maxRooms: 1
}

Role.Refueler.ROLE = "refueler";
Role.Refueler.BASE_NAME = "Rfl:";
Role.Refueler.MIN_COUNT = 1;
Role.Refueler.MAX_COUNT = 2;