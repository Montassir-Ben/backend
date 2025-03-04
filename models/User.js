const mongoose=require('mongoose');
const Joi=require('joi')
const jwt=require('jsonwebtoken')
//user schema

const UserSchema=mongoose.Schema({
    username:{
        type:String,
        required:true,
        trime:true,
        minlength:2,
        maxlength:100,
    },
    
    email:{
        type:String,
        required:true,
        trime:true,
        minlength:4,
        maxlength:100,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        trime:true,
        minlength:8,
    },
    profilePhoto:{
        type:Object,
        default:{
            url:"https://media.istockphoto.com/id/1337144146/fr/vectoriel/vecteur-dic%C3%B4ne-de-profil-davatar-par-d%C3%A9faut.jpg?s=612x612&w=0&k=20&c=BsQEN372p6cSuFnPGx06xUJ8eMhSjirWMAhodUi74uI=",
            publicId:null,
        }
    },
    bio:{
        type:String,
    },
    isAdmin:{
        type:Boolean,
        default:false,
    },
    isAccountVerified:{
        type:Boolean,
        default:false,
    },

},{
  timestamps:true,
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
}
);
UserSchema.virtual("posts",{
    ref:"Post",
    foreignField:"user",
    localField:"_id",
})
UserSchema.virtual("comments",{
    ref:"Comment",
    foreignField:"user",
    localField:"_id",
})
UserSchema.methods.generateAuthToken=function(){
  return jwt.sign({id:this._id, isAdmin:this.isAdmin},process.env.JWT_SECRET)
}


//User model
const User=mongoose.model('User',UserSchema)

//validate register user
function validateRegisterUser(obj){
const schema=Joi.object({
    username:Joi.string().trim().min(2).max(100).required(),
    email:Joi.string().trim().min(5).max(100).required().email(),
    password:Joi.string().trim().min(8).required(),
    
});
return schema.validate(obj);
}




function validateLoginUser(obj){
    const schema=Joi.object({
      
        email:Joi.string().trim().min(5).max(100).required().email(),
        password:Joi.string().trim().min(8).required(),
        
    });
    return schema.validate(obj);
    }

function validateUpdateUser(obj){
        const schema=Joi.object({
          
            username:Joi.string().trim().min(2).max(100),
            password:Joi.string().trim().min(8),
            bio:Joi.string(),
            
        });
        return schema.validate(obj);
        }
function validateEmail(obj){
    const schema=Joi.object({
        email:Joi.string().trim().min(2).max(100).required().email()
    
    })
    return schema.validate(obj)
}

function validateNewPassword(obj){
    const shema=Joi.object({
        password:Joi.string().trim().min(8).required()
    })
    return shema.validate(obj)
}

module.exports={
    User,
    validateRegisterUser,
    validateLoginUser,
    validateUpdateUser,
    validateEmail,
    validateNewPassword
}