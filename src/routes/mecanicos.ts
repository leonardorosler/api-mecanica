import { Router } from "express";

const router = Router()

router.get('/', (req, res)=>{
    res.send("Teste rota mecanicos")
})


export default router