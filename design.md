Register
POST /auth/register
BODY firstName,lastName,email?,Moblie,password,confirmPassword

- Response 201{ accessToken: String(id+role) ,user:{id,firstName,lastName},message:'Register Success' } , 400 {message:String,emailOrMobileExist: true} , 500 {message:String}

Login
POST /auth/login
BODY emailOrMoblie,password

- Response 201{ accessToken: String(id+role) ,user:{id,firstName,lastName},message:'Login Success' } , 400 {message:String,emailOrMobileExist: true} , 500 {message:String}
