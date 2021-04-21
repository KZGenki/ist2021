const express = require("express")
const fs = require("fs")
const app = express()
const path = require("path")
const axios = require("axios")
const port = 5000

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let readPathName = (name)=>{
    return fs.readFileSync(path.join(__dirname+"/view/"+name+".html"),"utf-8")
}


app.get("/",(request,response)=>{
    response.send(readPathName("index"))
})

app.get("/allProizvodi",(request,response)=>{
    axios.get("http://localhost:3000/allProizvodi")
    .then(res=>{
        let view=""
        //console.log(res.data)
        res.data.forEach(element =>{
            view+=`<tr>
            <td>${element.id}</td>
            <td>${element.kategorija}</td>
            <td>${element.cena.iznos} ${element.cena.valuta}</td>
            <td>${element.tekst}</td><td>`
            element.akcije.forEach(akcija=>{
                view+=`|${akcija.cena.iznos} ${akcija.cena.valuta} ${akcija.date}|`
            })
            view+=`</td><td>${element.tagovi}</td><td><a href="/detaljnije/${element.id}">Detaljnije</a></td></tr>`
        })
        response.send(readPathName("allProizvodi").replace("$[data]",view))
    })
})

app.post("/filterProizvodi",(request,response)=>{
    tags = request.body.tagovi
    console.log(tags)
    if(tags==""){
        response.redirect("/allProizvodi")
        return
    }
    axios.get("http://localhost:3000/searchTagsProizvodi/"+tags)
    .then(res=>{
        let view=""
        res.data.forEach(element =>{
            view+=`<tr>
            <td>${element.id}</td>
            <td>${element.kategorija}</td>
            <td>${element.cena.iznos} ${element.cena.valuta}</td>
            <td>${element.tekst}</td><td>`
            element.akcije.forEach(akcija=>{
                view+=`${akcija.cena}`
            })
            view+=`</td><td>${element.tagovi}</td><td><a href="/detaljnije/${element.id}">Detaljnije</a></td></tr>`
        })
        response.send(readPathName("allProizvodi").replace("$[data]",view))
    })
})

app.get("/addProizvod",(request,response)=>{
    response.send(readPathName("addProizvod"))
})

app.post("/saveProizvod",(request,response)=>{
    axios.post("http://localhost:3000/addProizvod",{
        kategorija:request.body.kategorija,
        cena:{
            iznos:request.body.cena,
            valuta:request.body.valuta
        },
        tekst:request.body.tekst,
        tagovi:request.body.tagovi,
        akcije:[]
    })
    response.redirect("/allProizvodi")
})

app.get("/detaljnije/:id", (request,response)=>{
    //console.log("/detaljnije")
    id = request.params["id"]
    axios.get(`http://localhost:3000/getProizvod/${id}`)
    .then(res=>{
        proizvod = res.data[0]
        //console.log(proizvod)
        data_proizvod=`<td>${proizvod.id}</td><td>${proizvod.kategorija}</td><td>${proizvod.cena.iznos} ${proizvod.cena.valuta}</td><td>${proizvod.tekst}</td><td>${proizvod.tagovi}</td><td><a href="/izmeni/${proizvod.id}">Izmeni</a> <a href="/obrisi/${proizvod.id}">Obrisi</a></td>`
        data_url="/saveAkcija/"+id
        data_akcije=""
        if(proizvod.akcije.length==0) data_akcije+="<td>-</td><td>-</td>"
        proizvod.akcije.forEach(akcija=>{
            data_akcije+=`<tr><td>${akcija.cena.iznos} ${akcija.cena.valuta}</td><td>${akcija.date}</td></tr>`
        })
        response.send(readPathName("detailsProizvod").replace("$[data.url]", data_url).replace("$[data.akcije]",data_akcije).replace("$[data.proizvod]",data_proizvod))
    })  
})

app.post("/saveAkcija/:id",(request,response)=>{
    id = request.params["id"]
    axios.post("http://localhost:3000/addAkcija/"+id,{
        cena: {
            iznos:request.body.cena,
            valuta:request.body.valuta
        },
        date:request.body.date
    })
    response.redirect("/detaljnije/"+id)
})

app.get("/obrisi/:id",(request,response)=>{
    id = request.params["id"]
    axios.delete("http://localhost:3000/deleteProizvod/"+id)
    response.redirect("/allProizvodi")
})

app.get("/izmeni/:id",(request,response)=>{
    id = request.params["id"]
    axios.get(`http://localhost:3000/getProizvod/${id}`)
    .then(res=>{
        proizvod = res.data[0]
        //console.log(proizvod)
        data_proizvod=`<td>${proizvod.id}</td><td>${proizvod.kategorija}</td><td>${proizvod.cena.iznos} ${proizvod.cena.valuta}</td><td>${proizvod.tekst}</td><td><a href="/izmeni/${proizvod.id}">Izmeni</a> <a href="/obrisi/${proizvod.id}">Obrisi</a></td>`
        data = `<label for="">Kategorija</label>
                <select name="kategorija" id="kategorija">
                    <option value="Laptopovi"`+((proizvod.kategorija=="Laptopovi")?`selected`:``)+`>Laptopovi</option>
                    <option value="Monitori"`+((proizvod.kategorija=="Monitori")?`selected`:``)+`>Monitori</option>
                    <option value="Stolovi"`+((proizvod.kategorija=="Stolovi")?`selected`:``)+`>Stolovi</option>
                    <option value="Stolice"`+((proizvod.kategorija=="Stolice")?`selected`:``)+`>Stolice</option>
                </select><br>
                <label for="">Cena</label><br>
                <input type="text" name="cena" value="${proizvod.cena.iznos}">
                <label for="">Valuta</label>
                <select name="valuta" id="valuta">
                    <option value="rsd" `+((proizvod.cena.valuta=="rsd")?`selected`:``)+`>RSD</option>
                    <option value="eur"`+((proizvod.cena.valuta=="eur")?`selected`:``)+`>EUR</option>
                </select><br>
                <label for="">Tekst</label><br>
                <input type="text" name="tekst" value="${proizvod.tekst}"><br>
                <label for="">Tagovi</label><br>
                <input type="text" name="tagovi" value="${proizvod.tagovi}"><br>`
        response.send(readPathName("emptyform").replace("$[data.form]",data).replace("$[data.url]","/saveEditedProizvod/"+id))
    })  
})

app.post("/saveEditedProizvod/:id",(request,response)=>{
    id = request.params["id"]
    console.log("saveEdit")
    console.log(request.body)
    axios.post("http://localhost:3000/editProizvod/"+id,{
        kategorija:request.body.kategorija,
        cena:{
            iznos:request.body.cena,
            valuta:request.body.valuta
        },
        tekst:request.body.tekst,
        tagovi:request.body.tagovi
        
    })
    response.redirect("/detaljnije/"+id)
})


app.listen(port, ()=>{console.log(`Klijent startovan na portu ${port}...`)})