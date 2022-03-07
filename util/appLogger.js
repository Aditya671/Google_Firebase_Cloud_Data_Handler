'use strict'

class AppLogger{
   static INFO = 'INFO';
   static DEBUG = "DEBUG";
   static ERROR = "ERROR";
   
   constructor(){
      // super();
   }

   static entryLogMethod(log,source){
      if(log && source){
         return console.log(`\n Starting Method --> ${source}`)
      }
   }
   static exitLogMethod(log,source){
      if(log && source){
         return console.log(`\n Executed Method --> ${source}`)
      }
   }
   static log(logMode,source,objErrorMsg){
      switch (logMode) {
         case AppLogger.INFO:
            console.info("\n Executing Source: "+source+" and it is "+objErrorMsg);
            break;
         case AppLogger.DEBUG:
            console.warn("\n Debugging in Source: "+source+" and it is "+objErrorMsg);
            break;
         case AppLogger.ERROR:
            console.error("\n There's an Error in Source: "+source+" and it is "+objErrorMsg);
            break;
         default:
            console.log("Wrong Way of Debgging");
            break;
      }
   }

}
module.exports = AppLogger;