class HttpStatus{
   constructor(errorCode,description,type){
      super();
      this.description = description;
      this.code = errorCode;
      this.type = type;
   }
}

module.exports = HttpErrors;