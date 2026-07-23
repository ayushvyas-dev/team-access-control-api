import { Router } from "express";

const authRouter = Router()

authRouter.post('/register', (req, res) => {
    res.send('register endpoint')
})

authRouter.post('/login', (req, res) => {
    res.send('login endpoint')
})

authRouter.post('/logout', (req, res) => {
    res.send('logout endpoint')
})

authRouter.post('/logout-all', (req, res) => {
    res.send('logout-all endpoint')
})

authRouter.post('/refresh', (req, res) => {
    res.send('refresh endpoint')
})

authRouter.get('/sessions', (req, res) => {
    res.send('get sessions endpoint')
})

authRouter.delete('/sessions/:sessionId', (req, res) => {
    res.send('delete session endpoint')
})



export default authRouter;