import { toast } from "react-toastify";
import { FireAuth } from "../../firebase";

const state = true;
const successStatement = 'You are now Logged In'
const noImage =
   "https://via.placeholder.com/284x424.jpeg/242582/ffffff?text=User";
   let idToken = {};

const logOut = () => {
   FireAuth.signOut().then(() => {
      toast.success('LoggedOut Successfully', {
         autoClose: 1000
      })
      return state
   }).catch((error) => {
      let errorS = 'Please login First'
      toast.error(errorS, {
         autoClose: 1000
      });
      console.log(error.message); 
      return !state;
   });
}

const logState = () => {
   let authData = {},idTokenData = {};
   let newData = [];
   FireAuth.onAuthStateChanged((user) => {
      if (user) {
         const user = FireAuth.currentUser;
         let logger = Object.assign(authData,{
            id:user.uid,
            name:user.displayName,
            email:user.email,
            verified:user.emailVerified,
            userImage:user.photoURL,
            contactInfo:user.phoneNumber
         });
         newData.push(logger)
         let idToken = Object.assign(idTokenData,{
            idToken:user.getIdTokenResult()
         });
         newData.push(idToken);
      }
      else {
         authData = {}
      }
      return {newData};  
   });
   return {newData};  
}

const LoginOrCreate = (data,action) => {

   if(!data){
      alert('Either Email or Password is incorrectly written');
      return false
   }
   else{
      if(action === 'newuser'){
         const {email,password,username,phone} = data
         FireAuth.createUserWithEmailAndPassword(email,password)
         .then((userCredential) => {
            let user = userCredential.user.email
            if(user){
               let userData = FireAuth.currentUser
               userData.updateProfile({
                  displayName: username,
                  photoURL: noImage,
                  phoneNumber:phone,
                  emailVerified:true
               }).then(() => {
                  toast.success(`${successStatement} ${username}`, {
                     autoClose: 1000
                  })
                  return state
               }).catch((error) => {
                  toast.error(error.code, {
                     autoClose: 1000
                  });
                  return !state
               })
            }
         })
         .catch((error) => {
            toast.error(error.code, {
               autoClose: 2000
            });
            console.log(error.code);
            return !state
         })
      }
      if(action === 'login'){
         const {email,password} = data
         FireAuth.signInWithEmailAndPassword(email,password)
         .then((userCredential) => {
            let user = userCredential.user.email
            if(user){
               toast.success(successStatement, {
                  autoClose: 1000
               })
               return true;
            }
         })
         .catch((error) => {
            toast.error(error.message, {
               autoClose: 1000
            });
            console.log(error.message);
            return !state
         })
      }
   }
}

const googleLogin = () => {
   var provider = new FireAuth.GoogleAuthProvider();
   provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
   provider.setCustomParameters({
      'login_hint': 'user@example.com'
    });
   FireAuth.signInWithPopup(provider)
  .then((result) => {
     console.log(result)
    /** @type {firebase.auth.OAuthCredential} */
    let credential = result.credential;
    console.log(credential)
    // This gives you a Google Access Token. You can use it to access the Google API.
   //  let token = credential.accessToken;
    // The signed-in user info.
   //  let user = result.user;
    // ...
  }).catch((error) => {
    console.log(error.message)
   //  let errorCode = error.code;
   //  let errorMessage = error.message;
   //  let email = error.email;
   //  let credential = error.credential;
    // ...
  });
}


const funAuth = {
   logState,
   logOut,
   googleLogin,
   LoginOrCreate
}
export default funAuth;