'use strict';

/*
 * Returns whether or not this roomposition is equal to another
 * roomposition or object containing pos
 */
RoomPosition.prototype.samePositionAs = function(other) {
   if (other.roomName && other.x && other.y) {
      return (this.roomName === other.roomName && this.x == other.x && this.y == other.y);
   }
   else if (other.pos && other.pos.roomName && other.pos.x && other.pos.y) {
      return (this.roomName === other.pos.roomName && this.x == other.pos.x && this.y == other.pos.y);
   }
   else {
      return false;
   }
}