import express from "express"

import routesMecanicos from "./routes/mecanicos"
import routesPecas from "./routes/pecas"
import routesConsertos from "./routes/consertos"
import routesUsuarios from "./routes/usuarios"

const app = express()
const port = 3000

app.use(express.json())

app.use("/mecanicos", routesMecanicos);
app.use("/pecas", routesPecas);
app.use("/consertos", routesConsertos);
app.use("/usuarios", routesUsuarios);

app.get('/', (req, res)=>{
    res.send("API oficina-mecanica")
    
})

app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`)
    console.log(`Acesse -> http://localhost:${port}`)
})
