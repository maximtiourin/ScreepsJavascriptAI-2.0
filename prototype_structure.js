'use strict'

Structure.prototype.getResourceCount = function() {
   return _.sum(this.store);
}