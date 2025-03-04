const mongoose=require('mongoose')

function dbConnection(){
    mongoose.connect(process.env.MONGO_URL)
    .then(()=>console.log("Connection To MongoDB "))
    .catch(error=>console.log("Connection Failed To MongoDB!",error))
}

module.exports=dbConnection