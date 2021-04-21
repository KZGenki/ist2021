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

let sviProizvodi = loadJSON

let dodajProizvod = (novProizvod)=>{
    try{
        proizvodi = loadJSON()
    }
    catch{
        proizvodi = []
    }
    finally{
        if(proizvodi.length==0){
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

app.get("/allProizvodi",(request,response)=>{
    response.send(sviProizvodi())//loadJSON()
    //console.log("/allProizvodi")
})

app.post("/addProizvod",(request,response)=>{
    //console.log(request.body)
    dodajProizvod(request.body)
    response.end("OK")
})

app.get("/getProizvod/:id", (request,response)=>{
    id = request.params["id"]
    proizvod = sviProizvodi().filter(proizvod=>proizvod.id==id)
    //console.log(proizvod)
    response.send(proizvod)
})

app.post("/addAkcija/:id",(request,response)=>{
    //console.log(request.body)
    id = request.params["id"]
    akcije = request.body
    proizvodi = sviProizvodi()
    proizvodi.forEach(proizvod => {
        if(proizvod.id==id){
            proizvod.akcije.push(akcije)
        }
    })
    storeJSON(proizvodi)
    response.end("OK")
})

app.delete("/deleteProizvod/:id",(request,response)=>{
    id = request.params["id"]
    proizvodi = sviProizvodi().filter(proizvod=>proizvod.id!=id)
    storeJSON(proizvodi)
    response.end("OK")
})

app.post("/editProizvod/:id",(request,response)=>{
    id = request.params["id"]
    proizvod = request.body
    console.log(request.body)
    proizvodi = sviProizvodi()
    proizvodi.forEach(pr =>{
        if(pr.id==id){
            pr.tekst = proizvod.tekst
            pr.cena = proizvod.cena
            pr.kategorija = proizvod.kategorija
            pr.tagovi = proizvod.tagovi
        }
    })
    storeJSON(proizvodi)
    response.end("OK")
})

app.get("/searchTagsProizvodi/:tags",(request,response)=>{
    console.log(request.params["tags"])
    tagovi = request.params["tags"]
    tags = tagovi.split(" ")
    proizvodi = sviProizvodi()
    filtrirano=[]
    finalList=[]
    tags.forEach(tag=>{
        filter = proizvodi.filter(proizvod=>proizvod.tagovi.includes(tag))
        filtrirano.push(filter)
    })
    filtrirano.forEach(filter=>{
        if(finalList.length==0){
            finalList = filter
        }
        else{
            filter.forEach(proizvod=>{
                if(finalList.filter(p=>p.id==proizvod.id).length==0){
                    finalList.push(proizvod)
                }
            })
        }
    })
    response.send(finalList)
})

app.listen(port,()=>{console.log(`Server startovan na portu ${port}...`)})