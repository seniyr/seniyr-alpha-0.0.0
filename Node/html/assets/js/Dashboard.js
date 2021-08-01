

let token = localStorage.getItem("Seniyr_token")
x= document.getElementById("message");
const fetch_user = async (node,jwtoken)=>{
    console.log("called")
    let options = {
        method : "GET" ,

        headers : {
            "Content-type" : 'application/json',
            "Authorization"  : `Bearer ${jwtoken}`
        },


    }

    const data = await fetch("/api/userinfo",options)
    .then ( (res)=>{
        return res.json();
    }).catch( (e)=>{
        console.log(" we have a eroror \n",e )
    })

    const {name , email, gender,city, college} = data
    x.value = `
    NAME : ${name}
    EMAIL  : ${email}
    GENDER : ${gender}
    City : ${city}
    College : ${college}
    `
    console.log(data)
}

fetch_user(x,token);