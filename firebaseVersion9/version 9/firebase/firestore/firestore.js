const lodash = require("lodash");
const AppLogger = require("../../../util/appLogger");
const HttpStatus = require("../../../util/httpStatus");
const {firestoreDb,firestoreMethods} = require("..");

/* 
This file contains all the possibilities for firebase functionality 
based on firebase 9
*/
class FireStoreFunctions {
  constructor(collection, doc) {
    // super();
    this.collection = collection;
    this.doc = doc;
    this.firedb = firestoreDb;
    this.firestoreMethods = firestoreMethods; 
    this.error = "Field is having an Error";
    this.success = "Field has been Updated";
  }
  static displayName = "Firestore Methods";

  async getAllAvailableCollectionNamesfromDoc(collectionName, docName) {
    // not usable with firebase 9
    const collectionInDoc = [];
    const source = "Firestorejs --> getAllAvailableCollectionNamesfromDoc";
    AppLogger.entryLogMethod(AppLogger.INFO, source);
    if (!collectionName || !docName) {
      AppLogger.log(
        AppLogger.ERROR,
        source,
        JSON.stringify(
          new HttpStatus(
            500,
            "Something Missing Collection Name || doc Name",
            "Parameter Error"
          )
        )
      );
    } else {
      await this.firestoreMethods.collection(collectionName).doc(docName)
      .listCollections().
      forEach((collection) => {
        collectionInDoc.push(collection.id);
      });
    }

    AppLogger.log(AppLogger.INFO, source, JSON.stringify(collectionInDoc));
    AppLogger.exitLogMethod(AppLogger, source);
    return collectionInDoc;
  }

  async getCompleteCollection(collectionName) {
    const completeData = [];
    const source = "Firestorejs --> getCompleteCollection";
    AppLogger.entryLogMethod(AppLogger.INFO, source);

    if (!collectionName) {
      AppLogger.log(
        AppLogger.INFO,
        source,
        JSON.stringify(new HttpStatus(500, "Please Enter Collection Name"))
      );
    } else {
        const docRef = this.firestoreMethods.getDocs(this.firestoreMethods.collection(this.firedb, collectionName));
        docRef.then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            if (doc.exists) {
              completeData.push(doc.data());
            }
          });
        });
      AppLogger.log(
        AppLogger.INFO,
        source,
        JSON.stringify(new HttpStatus(200, "Object", completeData))
      );
    }
    AppLogger.exitLogMethod(AppLogger, source);
    return completeData;
  }
  async getDocFromCollection(collectionName, docName) {
    const completeData = [];
    const source = "Firestorejs --> getDocFromCollection";
    AppLogger.entryLogMethod(AppLogger.INFO, source);
    if (!collectionName || !docName) {
      AppLogger.log(
        AppLogger.ERROR,
        source,
        JSON.stringify(
          new HttpStatus(
            500,
            "Something Missing Collection Name || doc Name",
            "Parameter Error"
          )
        )
      );
    } else {
        const docRef = this.firestoreMethods.getDoc(this.firedb, collectionName,docName);
        docRef.then((doc) => {
            if (doc.exists) {
              completeData.push(doc.data());
              AppLogger.log(
                AppLogger.INFO,
                source,
                JSON.stringify(new HttpStatus(200, "Data Available", "Success"))
              );  
            }else {
                throw new Error("No data avaialable");
            }
        })
        .catch((error) => {
          AppLogger.log(
            AppLogger.INFO,
            source,
            JSON.stringify(new HttpStatus(409, error, "FirebaseError"))
          );
        });
    }
    AppLogger.exitLogMethod(AppLogger, source);
    return completeData;
  }

  async addDoctoCollection(collectionName, docName, data) {
    const source = "Firestorejs --> addDoctoCollection";
    AppLogger.entryLogMethod(AppLogger.DEBUG, source);
    if (typeof data !== "object") {
      return new HttpStatus(500, "Data must be an Object", "DataType Error");
    }
    if (!collectionName || !docName) {
      AppLogger.log(
        AppLogger.ERROR,
        source,
        JSON.stringify(
          new HttpStatus(
            500,
            "Something Missing Collection Name || doc Name",
            "Parameter Error"
          )
        )
      );
      return new HttpStatus(
        500,
        "Something Missing Collection Name || doc Name",
        "Parameter Error"
      );
    }
    const added = await this.firestoreMethods
    .setDoc(this.firestoreMethods
        .doc(this.firedb, collectionName, docName),data,{ merge: true }
    );
    AppLogger.exitLogMethod(AppLogger.DEBUG, source);
    if (added.id !== null) {
      return new HttpStatus(200, `Document Added ${added.id}`, "Success");
    }
  }

  async updateDetailsOfDocument(collectionName, docName, data) {
    const source = "Firestorejs --> updateDetailsOfDocumene";
    AppLogger.entryLogMethod(AppLogger.DEBUG, source);

    const compareData = (previousDataSet, newData) => {
      return lodash.transform(previousDataSet, function (result, value, key) {
        if (!lodash.isEqual(value, newData[key])) {
          result[key] =
            lodash.isObject(value) && lodash.isObject(newData[key])
              ? compareData(value, newData[key])
              : value;
          // finalValue = result[key]
        }
      });
    };
    if (typeof data !== "object") {
      AppLogger.exitLogMethod(AppLogger.DEBUG, source);
      return new HttpStatus(500, "Data must be an Object", "DataType Error");
    }
    if (!collectionName || !docName) {
      AppLogger.log(
        AppLogger.ERROR,
        source,
        JSON.stringify(
          new HttpStatus(
            500,
            "Something Missing Collection Name || doc Name",
            "Parameter Error"
          )
        )
      );
      AppLogger.exitLogMethod(AppLogger.DEBUG, source);
      return new HttpStatus(
        500,
        "Something Missing Collection Name || doc Name",
        "Parameter Error"
      );
    } else {
      const prevData = this.getDocFromCollection(collectionName, docName);
      if (prevData !== null) {
        const tobeAdded = compareData(prevData, data);
        
        await this.firestoreMethods
        .updateDoc(this.firestoreMethods.doc(this.firedb, collectionName, docName),tobeAdded)
        .then((resp) => {
            AppLogger.exitLogMethod(AppLogger.DEBUG, source);
            return new HttpStatus(
              200,
              `${this.success} in ${resp}`,
              "FireStore Data"
            );
        })
        .catch((error) => {
            AppLogger.exitLogMethod(AppLogger.DEBUG, source);
            return new HttpStatus(500, `${error}`, "Firestore Error");
        });
      }
    }
  }

  async searchInDoc(collectionName, docName, query) {
    const source = "Firestorejs --> searchInDoc";
    const foundDataSet = [];
    AppLogger.entryLogMethod(AppLogger.INFO, source);
    if (!collectionName || !docName || query !== "object") {
      AppLogger.log(
        AppLogger.ERROR,
        source,
        JSON.stringify(
          new HttpStatus(
            500,
            "Something Missing Collection Name, doc Name, query",
            "Parameter Error"
          )
        )
      );
      return new HttpStatus(
        500,
        "Something Missing Collection Name || doc Name",
        "Parameter Error"
      );
    } else {
        const { param, operator, value } = query;
        const q = this.firestoreMethods.query(this.firestoreMethods.collection(this.firedb, collectionName), this.firestoreMethods.where(param, operator, value));
        const docRef = this.firestoreMethods.getDocs(q)
        .then(querySnapshot => {
            if(querySnapshot.empty){
                return foundDataSet;
            }else{
                querySnapshot.forEach((doc) => {
                    foundDataSet.push(doc.data());
                  });
    
            }               
        })
        .catch((error) => new HttpStatus(500, `FireStore Error ${error}`));
    }
    AppLogger.exitLogMethod(AppLogger.DEBUG, source);
    return foundDataSet;
  }

  async filterDoc(collectionName, docName, fieldKey) {
    const source = "Firestorejs --> filterDoc";
    const foundDataSet = [];
    AppLogger.entryLogMethod(AppLogger.DEBUG, source);
    if (!collectionName || !docName || fieldKey == "") {
      AppLogger.log(
        AppLogger.ERROR,
        source,
        JSON.stringify(
          new HttpStatus(
            500,
            "Something Missing Collection Name, doc Name, fieldKey",
            "Parameter Error"
          )
        )
      );
      return new HttpStatus(
        500,
        "Something Missing Collection Name || doc Name",
        "Parameter Error"
      );
    } else {
        const q = this.firestoreMethods.query(this.firestoreMethods.collection(this.firedb, collectionName),this.firestoreMethods.orderBy(fieldKey));
        const docRef = this.firestoreMethods.getDocs(q)
        .then(querySnapshot => {
            if(querySnapshot.empty){
                return foundDataSet;
            }else{
                querySnapshot.forEach((doc) => {
                    foundDataSet.push(doc.data());
                });
            }               
        })
    }
    AppLogger.exitLogMethod(AppLogger.DEBUG, source);
    return foundDataSet;
  }
  async realtimeChanges(type,collectionName,docKey){
    const source = "Firestorejs --> realtimeChanges";
    const data = {};
    AppLogger.entryLogMethod(AppLogger.DEBUG, source);
    if (!collectionName || !docKey || type == "") {
      AppLogger.log(
        AppLogger.ERROR,
        source,
        JSON.stringify(
          new HttpStatus(
            500,
            "Something Missing Collection Name, doc Name, fieldKey",
            "Parameter Error"
          )
        )
      );
      return new HttpStatus(
        500,
        "Something Missing Collection Name || doc Name",
        "Parameter Error"
      );
    }else{
      if(type === "collectionBased"){
        this.firestoreMethods.onSnapshot(collection(firestoreDb, collectionName), (d) => {
          Object.assign(data,
            doc.docs.map(d => ({
              id:d.id,
              data:d.data()
          }))  
          )
          return data;
        });
      }
      if(type === "docBased"){
        this.firestoreMethods.onSnapshot(
          doc(firestoreDb, collectionName,docKey), (d) => [d.data()]
        );
      }
    }
    AppLogger.log(AppLogger.INFO, source, JSON.stringify(data));
    AppLogger.exitLogMethod(AppLogger, source);
  }
}
module.exports = FireStoreFunctions;
