import _ from "lodash";
import { toast } from "react-toastify";
import { Firedb } from "../../firebase";

let successStatement = 'Field has been Updated'
let errorStatement = 'Field is having an Error'

/**
 * Global Values :
 *    1. urlToChange = its a Firebase database object path
 *    2. successStatement and errorStatement
 * 
 * Methods Order in this template: 
 *    0. Fetch Only Keys Example: for Adding New Data = used in Initialising State and catch value then store
 *    1. fetch all DataSets (including Key and Values)
 *    2. Update a Single DataSet variable
 *    3. Update/Change a Single DataSet values
 *    4. Delete a DataSet in database
 *    5. Search a Record in database
 *    6. Paginate Records coming from database
 *    7. Push Complete Record in database
 *    8. Obtain only Selected data from each selected data set 
 *    
 */

// 0. Function to Fetch all the Keys inside the unique Key to store data
const fetchKeys = (urlToChange) => {
   let Recordkeys = [],
      arrKeys = [],
      objKeys = {}
   if (!urlToChange){
      alert('url Missing')
      return false;
   } 
   else {
      // Fetch Keys in records      
      Firedb.ref(urlToChange).once('value',snapshot => {
         snapshot.child(0).forEach(snap => {
            let currentKey = snap.key
            Recordkeys.push(currentKey)
         })
         return Recordkeys
      })
      .then(() => {
         Recordkeys.map(k => {
            return objKeys[k] = ''
         })
         arrKeys = arrKeys.push(...Recordkeys)
      })
      return {arrKeys,objKeys}
   }
}
// 1. Function to Fetch the Complete DataSets
const fetchRecords = (urlToChange) => {
   let completeDB = [];
   let Records = [];
   if (!urlToChange){
      alert('url Missing')
      return false;
   } 
   else {
      // Fetch and return complete records in database as Object 
      Firedb.ref(urlToChange).on("value", snapshot => {
         snapshot.forEach(snap => {
            let innerObj = {}
            Records = snap.val()
            Object.keys(Records).map(ke => {
               return innerObj[ke] = Records[ke]
            })
            completeDB.push({
               key: snap.key,
               ...innerObj
            })
         });
      })  
   }
   return completeDB;
}

// 2. Function to Change/Edit a Single Value in a Child value of a particular data key 
// Can be used for Changing any value we want on front End 
// Example : update ratings Property or Favourite Value
const doUpdateRecord = async (urlToChange,getKey,getValue ) => {
   if(!getValue || !getKey || !urlToChange){
      alert('Either the function attr are in wrong order or there is a missing value')
      return false
   }
   else{
      Firedb.ref(urlToChange).child(`${getKey}`)
      .update(getValue)
      .then(_ => {
         toast.success(successStatement, {
            autoClose: 2000
         });
      })
      .catch(error => {
         toast.error(errorStatement, {
            autoClose: 2000
         });
         console.log(error.message);
      })
   }
}
// 3. Function to Edit Complete data present in a record
// Uses Firebase Update Method
const editRecord = (urlToChange, id, valueToChange) => {
   // Check Values First
   if (!id || !urlToChange || !valueToChange) {
      alert('There is an error please Check')
      return false
   } else {
      let finalValue = ''
      let fetchDataSetValues = [], previousDataSet = []
      Firedb.ref(urlToChange).child(id).get().then(snapshot => {
         fetchDataSetValues = snapshot.val()
         let innerObj = {}
         // Cloned data set obtained from database 
         Object.keys(fetchDataSetValues).map(ke => {
            return innerObj[ke] = fetchDataSetValues[ke]
         })
         previousDataSet.push({
            ...innerObj
         })
         return previousDataSet;
      })
      .then(previousDataSet => {
         if (previousDataSet.indexOf(id)) {
            /* Check if the index of value is 1 or -1 */
            // Find which value needs to be updated
            const changes = (previousDataSet, valueToChange) => {
               return _.transform(previousDataSet, function (result, value, key) {
                  if (!_.isEqual(value, valueToChange[key])) {
                     result[key] = (_.isObject(value) && _.isObject(valueToChange[key])) ? changes(value, valueToChange[key]) : value;
                     finalValue = result[key]
                  }
               });
            }
            changes(previousDataSet, valueToChange)
            // console.log('value needs to be updated', finalValue)
            Firedb.ref(urlToChange).child(`${id}`)
            .update({
               ...finalValue
            })
            .then(_ => {
               toast.success(successStatement, {
                  autoClose: 2000
               });
            })
            .catch(error => {
               toast.error(errorStatement, {
                  autoClose: 2000
               });
               console.log(error.message);
            })
         } else {
            alert(errorStatement)
            return false;
         }
      })
   }
}
// 4. Function to Delete a Complete record from DataSet
const DeleteRecord = (urlToChange, id) => {
   let gettingDeleted = []
   let noDeleteAllow = _.range(0, 17)
   if (!urlToChange) return null
   else {
      if (noDeleteAllow.includes(Number(id))) {
         alert(`You Can't Delete this record ${id}`)
         return false;
      } else {
         Firedb.ref(urlToChange).child(`${id}`).remove()
            .then(() => {
               let data = {
                  record_id:id,
                  deleted:true
               }
               gettingDeleted.push(data)
               toast.success(successStatement)
            })
            .catch(err => {
               console.log(err)
               toast.error(errorStatement);
            })
         return true;
      }
   }
}
// 5. Function to Search a particular DataSet
// Search function has debouning concept present in it and works after pause of every 1s while writing queryString 
// Debouncing can also be done with lodash Library with the example provided below
/*
 *  const SearchRecords = _.debounce((urlToChange,term,termKey) => {
 *     getResults(urlToChange,term,termKey)
 *  },500)
 *
 */

const SearchRecord = (urlToChange,termKey, term) => {
   if (!term || !urlToChange || !termKey || term.length < 1) {
      Firedb.ref(urlToChange).off()
      return false
   } 
   else {
      let Records = [],
      obtainedDB = [];
      Firedb.ref(urlToChange).orderByChild(`${termKey}`)
         .startAt(term).endAt(term + "\uf8ff")
         .on('value', snapshot => {
            snapshot.forEach(snap => {
               let innerObj = {}
               Records = snap.val()
               Object.keys(Records).map(ke => {
                  return innerObj[ke] = Records[ke]
               })
               obtainedDB.push({
                  key: snap.key,
                  ...innerObj
               })
            });
         })
      return obtainedDB;
   }
}


// 6. Function to Show data according to Pagination if we have huge number of datasets available
const pagination = (urlToChange,keyToPaginate,currentPage, pageSize ) => {
   let Records = [],
      paginatedDB = [],
      finalRecords = [],
      lastVisible;
      if (currentPage === 1) {
         Firedb.ref(urlToChange)
         .orderByChild(keyToPaginate).limitToFirst(pageSize)
         .get().then(snapshot => {
            snapshot.forEach(snap => {
               let innerObj = {}
               Records = snap.val()
               Object.keys(Records).map(ke => {
                  return innerObj[ke] = Records[ke]
               })
               paginatedDB.push({
                  // key: snap.key,
                  ...innerObj
               })
            })
            return paginatedDB
         })
         .then(data => {
            _.remove(finalRecords)
            finalRecords.push(...data)
            let lastVisibledataset = _.findLast(paginatedDB, keyToPaginate)
            lastVisible = _.at(lastVisibledataset,keyToPaginate)
            sessionStorage.setItem('lastkey',lastVisible)
         })
      }
      else {
         // console.log(lastVisible)
         let sessionlastKey = sessionStorage.getItem('lastkey')
         Firedb.ref(urlToChange)
         .orderByChild(keyToPaginate).limitToFirst(pageSize)
         .startAfter(sessionlastKey).get()
         .then(snapshot => {
            snapshot.forEach(snap => {
               let innerObj = {}
               Records = snap.val()
               Object.keys(Records).map(ke => {
                  return innerObj[ke] = Records[ke]
               })
               paginatedDB.push({
                  key: snap.key,
                  ...innerObj
               })
            })
            console.log(paginatedDB)
            return paginatedDB
         })
         .then(data => {
            _.remove(finalRecords)
            finalRecords.push(...data)
            let lastVisibledataset = _.findLast(paginatedDB, keyToPaginate)
            lastVisible = _.at(lastVisibledataset,keyToPaginate)
            sessionStorage.setItem('lastkey',lastVisible)
            console.log(finalRecords,lastVisible)
         })
      }
}

// 7. Function to Push complete record in database
const pushData = (urlToChange, formValues, additionaltasks) => {
   if (!formValues || !urlToChange) return false
   else if(typeof formValues === 'object'){
      alert('Values must be submitted as an Object')
      return false;
   }
   else {
      Firedb.ref(urlToChange).push(formValues)
      .then(_ => {
         toast.success(successStatement, {
            autoClose: 2000
         })
         if(additionaltasks){
            setTimeout(() => {
               return additionaltasks
            }, 2100);
         }
         return true;
      })
      .catch(err => alert(errorStatement))
   }
}
// 8. Function to get a single record from a complete dataSet
const fetchRecord = (urlToChange, key) => {
   let Record = []
   if (urlToChange === '') return null;
   else {
      Firedb.ref(urlToChange).child(key).once('value')
      .then(snapshot => {
         Record.push({
            key: snapshot.key,
            ...snapshot.val()
         })
      })
      
      return Record;
   }
}
const totalDataSet = (urlToChange) => {
   if (!urlToChange) return alert('Url Needed')
   else {
      let final = []
      Firedb.ref(urlToChange).once('value')
      .then(snapshot => {
        return final.push(snapshot.numChildren())
      })
      return final
   }
}
// const getOnlySelectedValues = (urlToChange,valueKeys )
//    const finalSet = []
//    if(valueKeys instanceof Object || Array.isArray(valueKeys)){
//       valueKeys.map(key => {
//          return Firedb.ref(urlToChange+'/'+key).child(neededData).on('value', (snapshot) => {
//             const data = snapshot.val();

//           }, (errorObject) => {
//             console.log('The read failed: ' + errorObject.name);
//           });
//       }) 
//    }
//    else {

//    }
/**
 * Callback off function are added to stop multiple callbacks = globalDetach()
 * Global Listener is added to check what value is added, updated,filtered and deleted = globalListner()
 * Both the functions are required if pure javascript based application is developed with Firebase
 * functions are 
*/

const globalDetach = (urlToChange) => {
   Firedb.ref(urlToChange).off()
}
// Global Listeners
const globalListner = (urlToChange) => {
   Firedb.ref(urlToChange).on('child_changed', (snapshot) => {
      const updatedRec = snapshot.val();
      console.log('The Record \'' + updatedRec.Title + '\' has been Updated');
   })
   Firedb.ref(urlToChange).on('child_added', (snapshot, prevChildKey) => {
      const newRec = snapshot.val();
      console.log('new Record with Title: \'' + newRec.title + '\' and previous rec was ' +prevChildKey);
   })

   Firedb.ref(urlToChange).on('child_removed', (snapshot) => {
      const deletedRec = snapshot.val();
      console.log('The Record with titled \'' + deletedRec.Title + '\' has been deleted');
   });
}

// Below function is created to make all functions available to Components
const getDataStoreFun = {
   // dataUrl: urlToChange,
   getKeys: fetchKeys,
   getRecords: fetchRecords,
   updateInRecord: doUpdateRecord,
   deleteValueInRecord: DeleteRecord,
   editCompleteData: editRecord,
   searchInRecord: SearchRecord,
   paginateData: pagination,
   pushDataSet: pushData,
   getRecordfromKey: fetchRecord,
   totalRecords: totalDataSet,
   Detacher : globalDetach,
   Listener: globalListner
};
export default getDataStoreFun;


/*
***** Firebase Methods: *****
** update method  :  update a value 
** set method     :  override a value // use with caution 
** get method     :  obtain a particular value
** remove method  :  delete a particular  dataset 
** on,once method :  obtain complete records
** equalTo method : compare value from both end
** 

*/
