const express = require('express');
const app = express();

const path  = require("path");
const { open } = require('sqlite'); // core module
const sqlite3 = require('sqlite3');// using this we connect to database

const brcypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const axios = require('axios');  //similar to fetch on client side
const { query } = require('express');

app.use(cookieParser()); // this needs to be on top otherwise code gives bug sometimes.

require('dotenv').config()


//-------------------------Database-------------------------------------
// We would be using a Sqlite database of basic stuff . its not scalable  but it does the work for now.
// Note :  if the dabase is not there it would be created.

    var db =null ;
    // initialise the connection with object named db to a sqlite databse using open method.
    // one thing to note is we cannot change the name db, you have to copy paste entire function. 
    // or you can direclty just use this db only at a time. there would be less time when you need to connect to
    // multipledatabases

    const start_sqlite_dbserver = async (filepath)=>{
        
        filepath  = path.join(__dirname, filepath); 
        try {
            db = await open ({  // this is basicly returns promise object so we need to conenct to it first.
                filename : filepath,
                driver :sqlite3.Database

            });
        
        console.log("database is Connected");
        // name  = db;
        return db;
        }
        catch (e) {
            console.log(`Database error : ${db.message}`)
        }

    };
    start_sqlite_dbserver("./database/main.db");


// ------------------------------------------------------------------------




function Authenticator (req,res,next){
    // const authheader = req.headers['authorization'] 

    const {User_session } = req.cookies ;
    const authheader =  User_session;
    // console.log("BRO",authheader)

    if(authheader !==  undefined){
        // let jwtToken =  authheader.split(" ")[1];
        let jwtToken =  authheader;

        if(jwtToken === undefined){
            // no token, send the login page
            // res.sendFile("/restrictedHtml/Login.html" , {root:__dirname});
            res.redirect("/signin")

        }

        else{
            jwt.verify(jwtToken , "Seniyr" ,(err,payload)=>{

                if(err){
                    //invalid token , send the login page
                    console.log("HERE")
                    // res.sendFile("/restrictedHtml/Login.html" , {root:__dirname});
                    res.redirect("/signin")
                }

                else{ // valid token, redirect to the dashboard
                    //Code for sending if verified.
                    req.data = payload;
                    console.log("payload",payload)
                    next();
                }

            })
        }
    }
    else{
        // res.sendFile("/restrictedHtml/login.html" ,{root:__dirname})
        res.redirect("/signin")
    }
}; // authenticates the token. if not found. sends the login page. 
//if found,send the payload in req.data to next

function Authenticated (req,res,next){
    // const authheader = req.headers['authorization'] 

    const {User_session } = req.cookies ;
    const authheader =  User_session;
    // console.log("BRO",authheader)

    if(authheader !==  undefined){
        // let jwtToken =  authheader.split(" ")[1];
        let jwtToken =  authheader;     
            jwt.verify(jwtToken , "Seniyr" ,(err,payload)=>{

                if(err){
                    //invalid token , send the login page
                    // res.sendFile("/restrictedHtml/Login.html" , {root:__dirname});
                    console.log(err)
                }

                else{ // valid token, redirect to the dashboard
                    //Code for sending if verified.
                    req.data = payload;
                    console.log("payload",payload)
                    res.redirect("/dashboard/")
                }

            })
        
    }
    else{
        // res.sendFile("/restrictedHtml/login.html" ,{root:__dirname})
        next();
    }
}; // authenticates the token. if not found. sends the login page. 
//if found,send the payload in req.data to next

const  auth_handler= async (data,res)=>{
    let email = data.email
    console.log("OAUTH EMAIL IS", email);
    if(email != undefined){
        const query_to_check_user = `
        SELECT 
            *
        FROM
            USERS
        WHERE
            email = "${email}"
        ;`
        userverify = await db.get(query_to_check_user);
        if(userverify){
            const payload  = {username : email, }
            const jwtoken = jwt.sign(payload,"Seniyr")

            // res.setHeader("Set-Cookie",`User_Session = ${jwtoken}`)

            res.cookie("User_session",jwtoken,{ maxAge: 24*1000*60*60, httpOnly:true ,secure:false})
            // httponly would restrict that cokkie cannot be accesed from javascript or in genral programaticly
            // data   = {message:"Logged in Succesfully"}
            res.redirect("/dashboard")
        }
        else{

            res.status(400);
            res.send({message:"USER DO NOT EXIST< KINDLY REGISTER FIRST"})
        }
    }
}

const getuserprofile = async (req,res,next)=>{
    var {username}  =  req.data; // sent by authenticator
    if(username !== undefined){
        console.log("email",username )
        let email  = username;

        const profile_query  =`
        SELECT
            *
        FROM
            users
        WHERE
            email = "${email}"
        
        ;`;

        const profile  = await db.get(profile_query);
        console.log("profile",profile);
        req.data = profile;
    }
    next();
}

const errorhandler = (err,req,res,next) =>{

    console.log("Error handler",err);
    res.status(500);
    res.send("someerror occured")

    // incase you want client to handel
    // res.json({err: err})
}// any error occured in any of the middlewares is directly passed to final middleware which is this one




//----------NETWORK CALLS ----------------------------------------------------
app.use('/static/' , express.static( path.join( __dirname ,"/html/" )))

app.get('/' , (req,res)=>{
    console.log("here")
    // res.send(`${date}`);
    res.sendFile("html/index.html" , {root:__dirname}); 
});

app.get(`/signin*`,Authenticated, (req,res)=>{

    res.sendFile("/html/Login.html" , {root:__dirname});


}); // if logged in , redirect to dashboard, else login or register page via authenticator

app.get("/users/" , async (req,res) =>{
    const  query =  `
    SELECT *
    FROM Users

    `
    try {
        
        Userdetails = await db.all(query); // this is a promise
        res.send(Userdetails);
    }
    catch (e){
        console.log("Error is  : ",e.message);
    }
});


app.get("/Dashboard/",Authenticator, (req,res) =>{
    res.sendFile("/html/Dashboard.html" ,{root: __dirname })

}); // get user dashboard . redirect to login if not logged in


app.get("/api/userinfo",Authenticator,getuserprofile,(req,res)=>{
    const {name,email,gender,college,city} = req.data;
    var datatosend = {name,email,gender,college,city }
    res.send(datatosend);
});
 
app.get('/auth/github', (req,res)=>{
   res.redirect(
       `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`
   ) 
});

app.get('/auth/github/callback' , async (  { query : {code}} , res) =>{
    console.log("QUERY code",code)
    const body = {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_SERVER_SECRET,
        scope : "USER,public_repo",
        code,
    }

    // the code is genral to session but client secret is specefic to this host.
    const options = {headers : {accept : "application/json"}}

    Token = await axios
    .post('https://github.com/login/oauth/access_token',body,options)
    .then( (res)=>{
        // response looks likeAccept:
        // application/json
        //{"access_token":"gho_16C7e42F292c6912E7710c838347Ae178B4a", "scope":"repo,gist", "token_type":"bearer"}
        console.log("RESPONSE DATA",res.data)
        return res.data.access_token 
    })
    .then( (token)=>{
        console.log("GOT TOKEN :",token)
        // now we can make user detail request on behalf of the use with the token.
            //Authorization: token OAUTH-TOKEN
            //GET https://api.github.com/user
        
        // res.redirect(`https://github.com/?token=${token}`);
        return token;
    }).catch((e)=>{
        console.log(e);
    })

    if(Token !== undefined){
        options2 = {headers : {Authorization : `Bearer ${Token}` }}
        const Git_user_details = await axios.get( 'https://api.github.com/user',options2).catch((e)=>{
            console.log("Error in getting details" ,e)
        })
        // at this point we have already got user data from the oauth. and its authenticated since they r logged in.
        // so we just have to log them in.
        auth_handler(Git_user_details.data,res);
    }
})// https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps read more about it here
//--------------------------------------------------------------------


app.use(express.json());

//----------------------POST CALLS-------------------------------------------
// Standard format chosen for sending data is a data object with msg feild
app.post('/login/register' , async (req,res)=>{
    // console.log(req.body)
    // res.send(req.body)
    let data = {};
    try{
        const {name,email,gender,college,password,city} = req.body;
        console.log("THERE",password,req.body)
        hashpassword = await brcypt.hash(password,1);
        console.log(email);

    const emailchecker  = `
        SELECT 
            * 
        FROM 
            users
        WHERE 
            email = "${email}";`;

    const emailchecker_result =  await db.get(emailchecker);
    
    console.log("results",emailchecker_result)
    

        if(emailchecker_result == undefined){
            //create new user details
            const createquery = `
            INSERT INTO
                users (name, email, gender,college,password,city)
            VALUES
                ("${name}" , "${email}" ,"${gender}", "${college}","${hashpassword}","${city}")
            

            ;`;

            await db.run(createquery);
            data.message =  "User Created Succefully!"
            res.send(data)
        
        }
        else{
            //User already exist
            
            res.status(400); // bad request
            data.message = "User Already Exists! Try a diffrent email"
            res.send(data);
        }
    }
    catch(e){
        console.log(e.message)

    }
}); // this is for user to register with unique email and hash password salt = 1 defualt

app.post('/login',async (req,res)=>{
    let data = {};
    try{
        const {email,password}  = req.body
        
        checkacount_query = `
        SELECT 
            *
        FROM 
            users
        WHERE
            email = "${email}"
        
        ;`
        const checkacount  =  await db.get(checkacount_query);
        console.log(checkacount)
        if(checkacount == undefined){
            res.status(400);
            data.message = "Email not registered. \n kindly register first"
            res.send(data);
        
        }

        else {
            const password_match = await brcypt.compare(password,checkacount.password)
            // password_match = false;
            if(password_match === true){
                const payload  = {username : email, }
                const jwtoken = jwt.sign(payload,"Seniyr")

                // res.setHeader("Set-Cookie",`User_Session = ${jwtoken}`)

                res.cookie("User_session",jwtoken,{ maxAge: 24*1000*60*60, httpOnly:true ,secure:false})
                // httponly would restrict that cokkie cannot be accesed from javascript or in genral programaticly
                data   = {message:"Logged in Succesfully"}
                res.send(data)
            }
            else{
                res.status(400);
                data.message = "invalid password"
                res.send(data);
            }
        }
    
    }
    catch(e){
        console.log(e.message);
    }
} ); // this is for login authentication. we get message and token object.


app.use(errorhandler)




app.listen(3000, ()=>{
    console.log("server started on port 3000")
});
