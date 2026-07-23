import { Router } from "express";

const healthRouter = Router()

healthRouter.get('/live', (req, res) => {
    res.send('live endpoint')
})

healthRouter.get('/ready', (req, res) => {
    res.send('ready endpoint')
})

export default healthRouter;