const express=require("express")
const connectToDB=require('./config/connectToDb')
const authRoutes=require('./routes/authRoute')
const userauth=require('./routes/usersRoute')
const postRoutes=require('./routes/postRoute')
const commentRoutes=require("./routes/commentRoute")
const categoryRoutes=require("./routes/categoryRoute")
const  passwordRoutes=require("./routes/passwordRoute")
const cors=require("cors")

const path=require('path')
const { errorHandler, notFound } = require("./middlewares/error")
require("dotenv").config()

//Connection To DB 
connectToDB()

//Init to App
const app=express()


//Middlewares
app.use(express.json())


app.use(cors({
    origin:"http://localhost:3000"
}))
app.use(authRoutes)
app.use(userauth)
app.use(postRoutes)
app.use(commentRoutes)
app.use(categoryRoutes)
app.use(passwordRoutes)


app.use(notFound)
app.use(errorHandler)


//Running  The Server
const PORT=process.env.PORT|| 8000
app.listen(PORT ,()=>
 console.log(`server is running in ${process.env.NODE_ENV} mode  on port ${PORT}`))



