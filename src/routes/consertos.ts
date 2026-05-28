import { Router } from "express";

const router = Router()

router.get('/', (req, res)=>{
    res.send("Teste rota consertos")
})

export default router