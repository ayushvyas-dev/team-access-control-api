import { Router } from "express";

const organizationRouter = Router()

organizationRouter.post('/organizations', (req, res) => {
    res.send('create organization endpoint')
})

organizationRouter.get('/organizations/', (req, res) => {
    res.send('list organizations endpoint')
})

organizationRouter.get('/organizations/:organizationId', (req, res) => {
    res.send('get organization endpoint')
})

organizationRouter.get('/organizations/:organizationId/members', (req, res) => {
    res.send('get organization members endpoint')
})

organizationRouter.patch('/organizations/:organizationId/members/:userId/role', (req, res) => {
    res.send('update member role endpoint')
})

organizationRouter.delete('/organizations/:organizationId/members/:userId', (req, res) => {
    res.send('remove member from organization endpoint')
})

organizationRouter.post('/organizations/:organizationId/invitations', (req, res) => {
    res.send('invite member endpoint')
})

organizationRouter.get('/organizations/:organizationId/invitations', (req, res) => {
    res.send('list organization invitations endpoint')
})

organizationRouter.post('invitations/:token/accept', (req, res) => {
    res.send('accept invitation endpoint')
})

organizationRouter.post('invitations/:token/resend', (req, res) => {
    res.send('resend invitation endpoint')
})

organizationRouter.delete('invitations/:token/decline', (req, res) => {
    res.send('decline invitation endpoint')
})

organizationRouter.get('/organizations/:organizationId/audit-logs', (req, res) => {
    res.send('get organization audit logs endpoint')
})

export default organizationRouter;