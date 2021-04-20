const fs = require("fs")
const express = require("express")
const PATH = "proizvodi.json"
const port = 3000
var app = express()

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let loadJSON = ()=>{
    let proizvodi = fs.readFileSync(PATH, (err,data)=>{
        if(err) throw err
        return data
    })
    return JSON.parse(proizvodi)
}
let storeJSON = (data)=>{
    fs.writeFileSync(PATH, JSON.stringify(data))
}

let dodajProizvod = (novProizvod)=>{
    try{
        proizvodi = loadJSON()
    }
    catch{
        proizvodi = []
    }
    finally{
        if(proizvodi.length=0){
            id = 0
        }
        else{
            id = proizvodi[proizvodi.length-1].id+1
        }
        novProizvod.id=id
        proizvodi.push(novProizvod)
        storeJSON(proizvodi)
    }
    
}


app.get('/',(request,response)=>{
    response.send("Server radi")
})

app.listen(port,()=>{console.log(`Server startovan na portu ${port}...`)})