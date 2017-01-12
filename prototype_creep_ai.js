'use strict';

Creep.prototype.AI = {
   Deposit: {},
   Mine: {},
   Move: {},
   Pickup: {},
   Withdraw: {}
};

//The pathfinding opts that will be used through out the creep's ai calls
Creep.prototype.pathfindingRules = {};

/*
 * Sets the pathfinding opts that will be used through out the creep's ai calls
 */
Creep.prototype.AI.registerPathfindingRules = function(rules) {
   this.pathfindingRules = rules;
}

/*
 * Sets the needEnergy memory flag in the creep based on whether or not
 * its carry energy capacity is full or completely empty
 */
Creep.prototype.AI.toggleNeedEnergy = function() {
   let mem = this.memory;
   if (mem.needEnergy && this.isCarryFull()) {
      mem.needEnergy = false;
   }
   else if (!mem.needEnergy && this.isCarryEmpty()) {
      mem.needEnergy = true;
   }
}

/*
 * Attempts to deposit energy in the target, moving to it if necessary
 * If the target is full, does a 1 tile random wander away from target, to prevent blocking a position indefinitely
 */
Creep.prototype.AI.Deposit.inTarget = function(target, resourceType) {
   let ret = this.transfer(target, resourceType);

   if (ret == ERR_NOT_IN_RANGE) {
      this.moveTo(target);
   }
   else if (ret == ERR_FULL) {
      this.AI.Move.wanderAwayFromTarget(target);
   }
}

/*
 * First makes sure the creep is standing on pos, then try to mine target 
 */
Creep.prototype.AI.Mine.targetFromPosition = function(target, pos) {
   let mpos = this.pos;

   if (!this.AI.Move.smartMoveTo(pos)) {
      this.harvest(target);
   }
}

/*
 * Moves to the target position using a moveTo call, however, does a check to see if
 * currently already at the position to prevent wasting .2 cpu on a moveTo call if not necessary.
 * Returns true if it had to move
 * Returns false if it was already at target position
 */
Creep.prototype.AI.Move.smartMoveTo = function(target) {
   let mpos = this.pos;

   if (!mpos.samePositionAs(target)) {
      this.moveTo(target);
      return true;
   }
   else {
      return false;
   }
}

Creep.prototype.AI.Move.wanderAwayFromTarget = function(target) {
   let directions = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];

   let directionToTarget = this.pos.getDirectionTo(target);

   directions = _.pull(directions, directionToTarget);

   this.move(_.sample(directions));
}

/*
 * Attempts to pickup the resource, moving to it if necessary
 */
Creep.prototype.AI.Pickup.target = function(target) {
   let ret = this.pickup(target);

   if (ret == ERR_NOT_IN_RANGE) {
      this.moveTo(target);
   }
}

/*
 * Attempts to withdraw the resource from the target, moving to it if necessary
 * If the target is empty, does a 1 tile random wander away from target, to prevent blocking a position indefinitely
 */
Creep.prototype.AI.Withdraw.fromTarget = function(target, resourceType) {
   let ret = this.withdraw(target, resourceType);

   if (ret == ERR_NOT_IN_RANGE) {
      this.moveTo(target);
   }
   else if (ret == ERR_NOT_ENOUGH_RESOURCES) {
      this.AI.Move.wanderAwayFromTarget(target);
   }
}