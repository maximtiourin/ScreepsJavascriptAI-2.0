'use strict';

//The pathfinding opts that will be used through out the creep's ai calls
Creep.prototype.pathfindingRules = {};

/*
 * Sets the pathfinding opts that will be used through out the creep's ai calls
 */
Creep.prototype.registerPathfindingRules = function(rules) {
   this.pathfindingRules = rules;
}