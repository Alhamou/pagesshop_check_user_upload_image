
const FileUtilsClass = require("./fileUtils")

const filePath = "output.json"


const fileUtils = new FileUtilsClass()

;(async ()=>{

  try{
    await fileUtils.recordEmailTimestamp(filePath, ".$emad:@test2.com")
  }catch(e){
    console.error(e)
  }

})()
