import express from "express"
const app = express()
const port = 3000

app.use(express.json())

app.get('/', (req, res)=>{
    res.send("Teste 001")
})

app.listen(port, () => {console.log(`Servidor rodando na porta: ${port}`)})