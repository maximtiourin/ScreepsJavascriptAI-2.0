'use strict';

global.Log = {};

Log.line = function(text = "", roomName = undefined, timestamp = true) {
   if (Config.logging) {
      console.log(((timestamp)   ?  (Log.timestamp()) :  (""))
               +  ((roomName)    ?  (Log.roomName(roomName)) : (""))
               +  text);
   }
}

Log.timestamp = function() {
   return "[" + Game.time + "] ";
}

Log.roomName = function(roomName) {
   return roomName + " : ";
}