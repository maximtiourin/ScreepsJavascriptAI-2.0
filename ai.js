'use strict';

global.AI = {
   Deposit: {},
   Mine: {},
   Move: {},
   Pickup: {},
   Withdraw: {}
}

/*
 * Sets the needEnergy memory flag in the creep based on whether or not
 * its carry energy capacity is full or completely empty
 */
AI.toggleNeedEnergy = function(creep) {
   let mem = creep.memory;

   if (mem.needEnergy && creep.isCarryFull()) {
      mem.needEnergy = false;
   }
   else if (!mem.needEnergy && creep.isCarryEmpty()) {
      mem.needEnergy = true;
   }
}

/*
 * Attempts to deposit energy in the target, moving to it if necessary
 * If the target is full, does a 1 tile random wander away from target, to prevent blocking a position indefinitely
 */
AI.Deposit.inTarget = function(creep, target, resourceType) {
   let ret = creep.transfer(target, resourceType);

   if (ret == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
   }
   else if (ret == ERR_FULL) {
      AI.Move.wanderAwayFromTarget(creep, target);
   }
}

/*
 * First makes sure the creep is standing on pos, then try to mine target 
 */
AI.Mine.targetFromPosition = function(creep, target, pos) {
   let mpos = creep.pos;

   if (!AI.Move.smartMoveTo(creep, pos)) {
      creep.harvest(target);
   }
}

/*
 * Moves to the target position using a moveTo call, however, does a check to see if
 * currently already at the position to prevent wasting .2 cpu on a moveTo call if not necessary.
 * Returns true if it had to move
 * Returns false if it was already at target position
 */
AI.Move.smartMoveTo = function(creep, target) {
   let mpos = creep.pos;

   if (!mpos.samePositionAs(target)) {
      creep.moveTo(target);
      return true;
   }
   else {
      return false;
   }
}

AI.Move.wanderAwayFromTarget = function(creep, target) {
   let directions = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];

   let directionToTarget = creep.pos.getDirectionTo(target);

   directions = _.pull(directions, directionToTarget);

   creep.move(_.sample(directions));
}

/*
 * Attempts to pickup the resource, moving to it if necessary
 */
AI.Pickup.target = function(creep, target) {
   let ret = creep.pickup(target);

   if (ret == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
   }
}

/*
 * Attempts to withdraw the resource from the target, moving to it if necessary
 * If the target is empty, does a 1 tile random wander away from target, to prevent blocking a position indefinitely
 */
AI.Withdraw.fromTarget = function(creep, target, resourceType) {
   let ret = creep.withdraw(target, resourceType);

   if (ret == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
   }
   else if (ret == ERR_NOT_ENOUGH_RESOURCES) {
      AI.Move.wanderAwayFromTarget(creep, target);
   }
}