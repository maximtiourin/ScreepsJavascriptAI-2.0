'use strict';

/*
 * Utility functions for operating on Screeps specific objects
 *
 * the global object is  'FZ_'
 */

global.FZ_ = {};

//Array
FZ_.Array = {};
//GUID
FZ_.GUID = {};
FZ_.GUID.Creep = {};
//Calculate
FZ_.Calculate = {};
FZ_.Calculate.Creep = {};
//Group
FZ_.Group = {};
FZ_.Group.Creeps = {};
//List
FZ_.List = {};
FZ_.List.Creeps = {};
//Math
FZ_.Math = {};

/*
 * Staggers the operation to run every 'perTicks' of Game.time
 * 'operation' is a callback function
 */
FZ_.staggerOperation = function(perTicks, operation) {
   if (Game.time % perTicks == 0) {
      operation();
   }
}

/*
 * Concatenates the arrays, allowing either or both of them to be empty or undefined
 * If both arrays are empty or undefined, returns an empty array;
 */
FZ_.Array.concat = function(lhs, rhs) {
   if (lhs && lhs.length > 0 && rhs && rhs.length > 0) {
      return lhs.concat(rhs);
   }
   else if (lhs && lhs.length > 0) {
      return lhs;
   }
   else if (rhs && rhs.length > 0) {
      return rhs;
   }
   else {
      return [];
   }
}

/*
 * Generates a unique name for the creep by using its basename and appending
 * a unique number to the end.
 */
FZ_.GUID.Creep.generate = function(baseName) {
   let n = 1;

   let done = false;
   while (!done) {
       if (Game.creeps[(baseName + n)]) {
           n++;
       }
       else {
           done = true;
       }
   }

   return baseName + n;
}

/*
 * Returns the total cost of a bodypart array
 */
FZ_.Calculate.Creep.bodyCost = function(body) {
   return _.sum(body, function(part) {
      return BODYPART_COST[part];
   });
}

/*
 * Calculates the optimal body structure for a creep based on supplied weights and spendable energy
 *
 * -bodyWeights is an array of objects with the properties {part, min, max = undefined}
 *    - part is the string id of the bodypart type, ie: WORK, CARRY, etc
 *    - min is the minimum amount of those body parts to include no matter what
 *    - [optional] max is the maximum amount of those body parts to include, will use any remaining energy to try to fill
         parts are allocated based in the order they are encountered in the array, so the higher priority parts should be first
 *
 * -spendableEnergy is the maximum amount of energy you are willing to spend on this creeps creation, however,
 *    if only the minimum parts are used as specified, nothing is stopping them from costing more than the spendableEnergy.
 *    Therefore, spendableEnergy is only useful for capping how much energy is used towards adding "extra" bodyparts.
 */
FZ_.Calculate.Creep.optimalBodyConfig = function(bodyWeights, spendableEnergy) {
   let remainder = spendableEnergy;

   let bodyTotals = {};

   //Calculate min parts
   for (let i in bodyWeights) {
      let weight = bodyWeights[i];

      let type = weight.part;
      let min = weight.min;
      let max = weight.max;
      let cost = BODYPART_COST[type];

      bodyTotals[type] = min;

      remainder -= min * cost;
   }

   //Calculate extra parts
   for (let i in bodyWeights) {
      let weight = bodyWeights[i];

      let type = weight.part;
      let min = weight.min;
      let max = (weight.max) ? (weight.max) : (min); //If max is undefined, use min as the max
      let cost = BODYPART_COST[type];

      for (let ix = 0; ix < max - min; ix++) {
         if (remainder - cost >= 0) {
            remainder -= cost;
            bodyTotals[type]++;
         }
         else {
            break;
         }
      }
   }

   //Construct body
   let body = [];
   for (let type in bodyTotals) {
      let total = bodyTotals[type];

      for (let i = 0; i < total; i++) {
         body.push(type);
      }
   }

   //Calculate body total cost
   let cost = FZ_.Calculate.Creep.bodyCost(body);

   return {"body": body, "cost": cost};
}

/*
 * Groups the collection of creeps by their role, if any (if no role, groups by "none")
 *
 * Returns an object where each key is the role encountered in the collection, with a value of
 * all creeps that holds that role in the collection
 */
FZ_.Group.Creeps.byRole = function(creeps) {
   return _.groupBy(creeps, function(creep) {
      let mem = creep.memory;
      let role = mem.role;

      if (role) {
         return mem.role;
      }
      else {
         return "none";
      }
   });
}

/*
 * Returns a list of my creeps that are assigned to the specified room,
 * optionally filtering them by role, and/or an additional filter
 */
FZ_.List.Creeps.assignedToRoom = function(assignedRoom, role = undefined, additionalFilter = undefined) {
   let creeps = _.filter(Game.creeps, function(creep) {
      return   (creep.memory.assignedRoom === assignedRoom)
         &&    ((role) ? (creep.memory.role === role) : (true))
         &&    ((additionalFilter) ? (additionalFilter(creep)) : (true));
   });
}

FZ_.Math.clamp = function(value, min, max) {
   return Math.max(Math.min(value, max), min);
}

/*
 * Takes two objects that have properties 'x' and 'y' to find the distance squared between them
 */
FZ_.Math.distanceSquared = function(a, b) {
   let dx = b.x - a.x;
   let dy = b.y - a.y;
   return (dx * dx) + (dy * dy);
}