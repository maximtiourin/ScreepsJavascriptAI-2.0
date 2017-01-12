'use strict';
/*
 * Adds functions to the Room object that handle surveying the room for certain
 * information, and usually storing that information in the room's memory.
 */

/*
 * Runs all necessary surveying functions
 */
Room.prototype.survey = function() {
   let REFUELABLES_TICKS = 5; //Update refuelables
   let WITHDRAWABLES_TICKS = 5; //Update withdrawables

   let mem = this.memory;

   if (!mem.survey) {
      //These survey functions should only be done once per room
      this.surveyInit();
      this.surveyPrimarySpawn();
      this.surveySources();
      this.surveySourcePaths();
   }

   /* Here we can do surveying stuff that should be done constantly or more than once */
   //Refuelables
   FZ_.staggerOperation(REFUELABLES_TICKS, function() { this.surveyRefuelables() });
   //Withdrawables
   FZ_.staggerOperation(WITHDRAWABLES_TICKS, function() { this.surveyWithdrawables() });
}

/*
 * - registers memory address "memory.survey" as object
 */
Room.prototype.surveyInit = function() {
   let mem = this.memory;

   if (!mem.survey) {
      mem.survey = {
         refuelables: {
            list: []
         },
         withdrawables: {
            list: []
         }
      };
   }
}

/*
 * Determine the primary spawn for the room, which will be used for path generation
 */
Room.prototype.surveyPrimarySpawn = function() {
   let mem = this.memory;

   if (!mem.survey.primarySpawn) {
      let spawns = this.find(FIND_MY_SPAWNS);

      if (spawns.length > 0) {
         let spawn = spawns[0];

         mem.survey.primarySpawn = {"id": spawn.id, "pos": {"x": spawn.pos.x, "y": spawn.pos.y}};
      }
   }
}

Room.prototype.surveyRefuelables = function() {
   this.memory.survey.refuelables.list = FZ_.List.refuelables(this);
}

/*
 * Looks through all of the sources in the room
 * - registers memory address "memory.survey.sources" as object
 * - for each source found, puts into "memory.survey.sources" 
 *   the key 'source.id' and the value {pos: {x: source.pos.x, y: source.pos.y}}
 */
Room.prototype.surveySources = function() {
   let mem = this.memory;

   if (!mem.survey.sources) {
      let sources = this.find(FIND_SOURCES);

      if (sources.length > 0) {
         mem.survey.sources = {};

         for (let source of sources) {
            mem.survey.sources[source.id] = {"pos": {"x": source.pos.x, "y": source.pos.y}};
         }
      }
   }
}

/*
 * Generates paths for each source from "primary" spawn
 */
Room.prototype.surveySourcePaths = function() {
   let mem = this.memory;

   if (!mem.survey.sourcePaths) {
      mem.survey.sourcePaths = {};

      for (let key in mem.survey.sources) {
         let tSource = mem.survey.sources[key];
         let tSpawn = mem.survey.primarySpawn;
         let src = new RoomPosition(tSpawn.pos.x, tSpawn.pos.y, this.name);
         let dest = new RoomPosition(tSource.pos.x, tSource.pos.y, this.name);

         //Calculate path from spawn to this source
         let pathfind = PathFinder.search(src, {"pos": dest, "range": 1}, {"maxRooms": 1});

         let sourcePoint = pathfind.path[pathfind.path.length - 1];

         //Convert path to storePath, which is used for memory storage
         let storePath = [];
         for (let i = 0; i < pathfind.path.length; i++) {
            let step = pathfind.path[i];
            storePath.push({"x": step.x, "y": step.y});
         }

         //Store path
         mem.survey.sourcePaths[key] = {"path": storePath, "cost": pathfind.cost, "sourcePoint": {"pos": {"x": sourcePoint.x, "y": sourcePoint.y}}};
      }
   }
}

Room.prototype.surveyWithdrawables = function() {
   this.memory.survey.withdrawables.list = FZ_.List.withdrawables(this);
}