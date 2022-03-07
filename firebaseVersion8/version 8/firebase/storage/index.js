import { FireStorage } from "..";
import { toast } from 'react-toastify';

const uploadFile = (file) => {
   let isValid = true;
   let imageExts = ["jpg","jpeg","png"]
   let imageExtPos = file[0].lastIndexOf('.') + 1
   let fileSize = (file[0].size) / 1024;
   const imageExt = file[0].name.substring(imageExtPos,file.length)
   imageExts.filter((value) => {
      if(value === imageExt){
         return isValid
      }
      else {
         return !isValid
      }
   })

   
   if(isValid && fileSize < 300){
      FireStorage.ref().put(file)
      .then((spanshot) => {
         toast.success('File Uploaded Successfully' , {
            autoClose:1000
         })
      })
      .catch((err) => {
         toast.error(err.code,{
            autoClose:1000
         })
      })
   }
   else if(fileSize > 300){
      alert('The maximum size upload is 300Kb ')
      return false
   }
   else {
      return false
   }
}

export default uploadFile 