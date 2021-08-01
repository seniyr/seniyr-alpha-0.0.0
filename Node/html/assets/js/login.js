
function onSignIn(googleUser) {
    // Useful data for your client-side scripts:
    var profile = googleUser.getBasicProfile();
    console.log("ID: " + profile.getId()); // Don't send this directly to your server!
    console.log('Full Name: ' + profile.getName());
    console.log('Given Name: ' + profile.getGivenName());
    console.log('Family Name: ' + profile.getFamilyName());
    console.log("Image URL: " + profile.getImageUrl());
    console.log("Email: " + profile.getEmail());

    // The ID token you need to pass to your backend:
    var id_token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token);
    Google_data_handler(profile)
}; // For google sign in 

function Google_data_handler(profile){
console.log(".............")
}; // for data which comes from google

var servermsg = document.getElementById("servermsg")
document.getElementById('loginform').addEventListener('submit',async (e)=>{
    e.preventDefault();
    // console.log(e.target)
    let form =  e.target;
    let data = {};
    for(i=0 ; i<form.elements.length ;i++){
        let input = form.elements[i]
        if(input.name != "submit"){
            data[input.name]  = input.value;

        }
    
    }
    // console.log(data);
    useful_data = {};
    const {email,password} = data;
    useful_data.email = email;
    useful_data.password = password;

    let options = {
        method :"POST",
        headers : {
            "Content-type":"application/json",
        },
        body :JSON.stringify(useful_data)
    }
    var status ;
    let loginmsg =await fetch("/login",options)
    .then( (res)=>{
        status = res.status;
        return res.json()
    })
    .catch ((e)=>{
        console.log(e);
    });

    console.log("LOGIN : \n ",loginmsg);
    servermsg.value = loginmsg.message;
    if(status == 200){
        const {jwtoken} = loginmsg;
        localStorage.setItem("Seniyr-token",jwtoken);
        setTimeout(()=>{window.open("/Dashboard/");},1000)
        // due to this, we cannot let dashboard not be static page.
        
        
        

    }

    return false;
});

document.getElementById('registerform').addEventListener('submit',async (e)=>{
    e.preventDefault();
    console.log(e.target)
    let form =  e.target;
    let data = {};
    for(i=0 ; i<form.elements.length ;i++){
        let input = form.elements[i]
        if(input.name != "submit"){
            data[input.name]  = input.value;

        }
    
    }
    // console.log(data);
    useful_data = {};
        const { name,email,gender,college,password,city} = data;
        useful_data.name = name;
        useful_data.email = email;
        useful_data.gender = gender;
        useful_data.college = college;
        useful_data.password = password;
        useful_data.city = city;


    console.log(useful_data)
    
    let options = {
        method :"POST",
        headers : {
            "Content-type":"application/json",
        },
        body : JSON.stringify(useful_data)
    }
    let status;
    let registermsg =await fetch("/login/register",options)
    .then( (res)=>{
        status = res.status
        return res.json()
    } )
    .catch ((e)=>{
        console.log(e);
    });

    
    console.log("RESGISTER",registermsg.message);
    servermsg.value  = registermsg.message;
    return false;
});

 
console.log("hi")