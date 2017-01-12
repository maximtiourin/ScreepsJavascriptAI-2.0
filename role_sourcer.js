'use strict';

/*
 * The sourcer is responsible for mining from a source node and dropping mined energy on top of itself.
 * It also ensures that a container construction site is placed on top of its source point.
 * At the beginnings of a room, will deposit energy in spawn to help spawn refuelers
 */

Role.Sourcer = {}

Role.Sourcer.tick = function(creep) {
   //Register pathfinding rules
   creep.registerPathfindingRules(Role.Sourcer.pathfindingRules);

   let mem = creep.memory;

   let roomName = mem.assignedRoom;

   if (roomName) {
      let room = Game.rooms[roomName];

      if (room) {
         let roomMem = room.memory;
         
         //Get dispatch
         let specialized = room.getDispatch("sourcer", "specialized");
         if (specialized) {
            //Work to get some refuelers up and running
            AI.toggleNeedEnergy(creep);

            if (mem.needEnergy) {
               //Mine energy
               let assignedSource = mem.assignedSource;
               let sourcePoint = assignedSource.sourcePoint;
               let source = Game.getObjectById(assignedSource.id);

               if (source) {
                  AI.Mine.targetFromPosition(creep, source, new RoomPosition(sourcePoint.pos.x, sourcePoint.pos.y, roomName));
               }
            }
            else {
               //Refuel spawn
               let spawn = Game.getObjectById(roomMem.survey.primarySpawn.id);

               if (spawn) {
                  AI.Deposit.inTarget(creep, spawn, RESOURCE_ENERGY);
               }
            }
         }
         else {
            //Go mine forever
            //Maintain container
            Role.Sourcer.maintainContainer(room, creep);
            Role.Sourcer.validateContainer(creep);

            //Mine from sourcePoint
            let assignedSource = mem.assignedSource;
            let sourcePoint = assignedSource.sourcePoint;
            let source = Game.getObjectById(assignedSource.id);

            AI.Mine.targetFromPosition(creep, source, new RoomPosition(sourcePoint.pos.x, sourcePoint.pos.y, roomName));
         }
      } 
   }
}

Role.Sourcer.maintainContainer = function(room, creep) {
   let MAINTAIN_CONTAINER_MICRO_TICKS = 10;
   let MAINTAIN_CONTAINER_MACRO_TICKS = 100;

   let mem = creep.memory;

   let maintain = function() {
      let sPos = mem.assignedSource.sourcePoint.pos;
      let foundContainer = _.filter(room.lookForAt(LOOK_STRUCTURES, sPos.x, sPos.y), function(structure) {
         return structure.structureType === STRUCTURE_CONTAINER;
      });
      let foundContainerConstruction = _.filter(room.lookForAt(LOOK_CONSTRUCTION_SITES, sPos.x, sPos.y), function(structure) {
         return structure.structureType === STRUCTURE_CONTAINER && structure.my;
      });

      if (foundContainer.length == 0 && foundContainerConstruction.length == 0) {
         //Create container construction site
         room.createConstructionSite(sPos.x, sPos.y, STRUCTURE_CONTAINER);
      }

      if (foundContainer.length > 0) {
         //Assign container to memory
         mem.container = foundContainer[0].id;
      }
   }

   if (!mem.container) {
      FZ_.staggerOperation(MAINTAIN_CONTAINER_MICRO_TICKS, maintain);
   }
   else {
      FZ_.staggerOperation(MAINTAIN_CONTAINER_MACRO_TICKS, maintain);
   }
}

/*
 * Returns the sourcer's container object, while making sure that it is a valid
 * object, purging the memory entry if invalid
 */
Role.Sourcer.validateContainer = function(creep) {
   let mem = creep.memory;

   if (mem.container) {
      let container = Game.getObjectById(mem.container);

      if (container) {
         return container;
      }
      else {
         mem.container = undefined;
         return undefined;
      }
   }
   else {
      return undefined;
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
   return (BODYPART_COST[WORK] * 2) + (BODYPART_COST[CARRY]) + (BODYPART_COST[MOVE]);
}

/*
 * Pathfinding rules to use for this role
 */
Role.Sourcer.pathfindingRules = {
   ignoreCreeps: true,
   reusePath: 10, //Save paths for 10 ticks
   maxOps: 100, //0.1 CPU max
   maxRooms: 1
}

Role.Sourcer.ROLE = "sourcer";
Role.Sourcer.BASE_NAME = "S:";
