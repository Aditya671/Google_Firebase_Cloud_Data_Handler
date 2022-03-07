const AppLogger =  require("./../../../util/appLogger");
const HttpStatus = require("./../../../util/httpStatus");
const {auth} = require("../../firebase");
const {getAuth,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut} = auth;

class FirebaseAuthController {
   constructor(){
      this.auth = auth.getAuth();
      this.error = "Field is having an Error";
      this.success = "Field has been Updated";
      // this.auth = getAuth();
   }
   static displayName = "Firebase Authenticator Methods";

   async checkLoginStatus(){
      let authData = {};
      try{
         const source = "firebaseAuthControllerJs --> checkLoginStatus";
         AppLogger.entryLogMethod(AppLogger.INFO, source);
         onAuthStateChanged(this.auth,(user) => {
            if (user) {
               const user = getAuth().currentUser;
               Object.assign(authData,{
                  id:user.uid,
                  name:user.displayName,
                  email:user.email,
                  verified:user.emailVerified,
                  userImage:user.photoURL,
                  contactInfo:user.phoneNumber,
                  idToken:user.getIdToken(),
               })
               return authData;
            }
            else {
               return authData;
            }
         });
      }catch(err){
         throw new HttpStatus(500,err,"Exception");
      }
      finally{
         AppLogger.exitLogMethod(AppLogger, source);
      }
   }
   async loginWithEmailPassword(email,password){
      try{
         const source = "firebaseAuthControllerJs --> loginWithEmailPassword";
         AppLogger.entryLogMethod(AppLogger.INFO, source);
         if(!email){
            AppLogger.log(
               AppLogger.ERROR,source,
               JSON.stringify(
                  new HttpStatus(500,"email & password missing","Parameter Error")
               )
            );
         }
         else{
            // const {email,password} = data;
            signInWithEmailAndPassword(this.auth,email,password)
            .then((userCredential) => {
               let user = userCredential.user.getIdToken();
               if(user){
                  AppLogger.log(AppLogger.INFO, source, JSON.stringify(user));
                  return user;
               }
            })
            .catch((error) => {
               throw error;
            });
         }
      }
      catch(err){
         return new HttpStatus(500,err,"Exceptoin Occured");
      }
      finally{
         AppLogger.exitLogMethod(AppLogger, source);
      }
   }
   async signUpWithEmailPassword(data){
      try{
         const source = "firebaseAuthControllerJs --> signUpWithEmailPassword";
         AppLogger.entryLogMethod(AppLogger.INFO, source);
         if(!data){
            AppLogger.log(
               AppLogger.ERROR,source,
               JSON.stringify(
                  new HttpStatus(500,"email & password missing","Parameter Error")
               )
            );
         }
         else{
            const {email,password} = data;
            createUserWithEmailAndPassword(this.auth,email,password)
            .then((userCredential) => {
               let user = userCredential.user.email
               if(user){
                  let userData = this.auth.currentUser
                  userData.updateProfile({
                     displayName: data.username,
                     photoURL: data.userImage === null ? noImage : data.userImage,
                     contactInfo:data.phone,
                     emailVerified:false
                  }).then(() => {
                     return userData;
                  }).catch((error) => {
                     throw error;
                  });
               }
            })
            .catch((error) => {
               throw error;
            });
         }
      }
      catch(err){
         return new HttpStatus(500,err,"Exceptoin Occured");
      }
      finally{
         AppLogger.exitLogMethod(AppLogger, source);
      }
   }
   async logout() {
      try{
         const source = "firebaseAuthControllerJs --> logout";
         AppLogger.entryLogMethod(AppLogger.INFO, source);
         if(!data){
            AppLogger.log(
               AppLogger.ERROR,source,
               JSON.stringify(
                  new HttpStatus(500,"Somethings missing","Parameter Error")
               )
            );
         }
         else{
            signOut(auth).then((data) => {
               return data;
            })
            .catch((error) => {
               throw error;
            });
         }
      }
      catch(err){
         return new HttpStatus(500,err,"Exceptoin Occured");
      }
      finally{
         AppLogger.exitLogMethod(AppLogger, source);
      }
   }

}
module.exports = FirebaseAuthController;