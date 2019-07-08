const express = require('express')
const Invoice = require('../models/invoice')
const router = new express.Router()
const uniqid = require('uniqid')
const auth = require('../middleware/auth')


// create new invoice
// router.post('/invoices', auth, async (req, res) => {
router.post('/invoices', async (req, res) => {
    // console.log(req.body)
    const invoiceNumber = uniqid.process()
    // console.log(invoiceNumber)
    const invoice = new Invoice({
        // add owner to body
        ...req.body,
        invoiceNumber
        //,
        //owner: req.user._id // this value comes from the user const defined in the auth middleware
    })
    try {
        await invoice.save()
        res.status(201).send(invoice)
        //console.log(req.body)
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

// get all created invoices
router.get('/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.find({})
        res.status(200).send(invoices)
    } catch (e) {
        res.status(500).send()
    }
})


// get specific invoice. Unlike the route above,
// this doesn't require auth, so that means the req.user._id would be undefined
// this is because req.user is undefined
// hence why we use findById(_id)
router.get('/invoices/:id', async (req, res) => {
    // this will be passed as an argument to findOne
    // note id: _id wouldn't work here, hence the object deconstruction being applied
    const _id = req.params.id
    try {
        const invoice = await Invoice.findById(_id)
        if (!invoice) {
        return res.status(404).send()
    }
        res.send(invoice)
    } catch (e) {
        res.status(500).send()
    }
})

// get specific item in a specific invoice
router.get('/invoices/:id/items/:itemId', async (req, res) => {
    // get the invoice id
    const _id = req.params.id
    // console.log(_id)
    // get the item id specific to the invoice
    const itemId = req.params.itemId
    // console.log(itemId)
    try {
        // find specific invoice
        const invoice = await Invoice.findById(_id)
        // fine specific item in invoice
        const invoiceItem = await invoice.invoiceItemInfo.id(itemId)
        // console.log(invoiceItem)
        // send error status code NOT FOUND if item doesn't exist
        if (!invoiceItem) {
        return res.status(404).send('item not found')
    }
        res.status(200).send(invoiceItem)
        console.log(invoiceItem)
    } catch (e) {
        res.status(500).send()
        // console.log(e)
    }
})

// remove specific item in a specific invoice
router.delete('/invoices/:id/items/:itemId', async (req, res) => {
    // get the invoice id
    const _id = req.params.id
    // console.log(_id)
    // get the item id specific to the invoice
    const itemId = req.params.itemId
    // console.log(itemId)
    try {
        // find specific invoice
        const invoice = await Invoice.findById(_id)
        // fine specific item in invoice and remove it
        const invoiceItem = await invoice.invoiceItemInfo.id(itemId).remove()
        // save invoice to that item has been deleted
        invoice.save()
        // send error status code NOT FOUND if item doesn't exist
        if (!invoiceItem) {
        return res.status(404).send('item not found')
    }   
        res.send()
        // console.log('item removed')
    } catch (e) {
        res.status(500).send()
        // console.log(e)
    }
})

// update specific invoice
// router.patch('/invoices/:id', auth, async (req, res) => {
router.patch('/invoices/:id', async (req, res) => {
    // const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    const updates = Object.keys(req.body)
    const allowedUpdates = [
        'clientName',
        'companyName',
        'companyBankName',
        'companyAccountNumber',
        'phoneNumber']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!'})
    }

    const _id = req.params.id
    try {
        // const invoice = await Invoice.findOne({_id, owner: req.user._id })
        const invoice = await Invoice.findOne({_id})

        if (!invoice) {
            res.status(404).send()
        }

        updates.forEach((update) => {
            invoice[update] = req.body[update]
        })
        await invoice.save()
        res.send(invoice)

    } catch (e) {
        res.status(500).send()
        console.log(e)
    }
})

//update specific invoice item
router.patch('/invoices/:id/items/:itemId', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = [
        'amountPaid',
        'itemDescription',
        'itemCategory',
        'itemPrice',
        'itemQuantity',
        'itemDiscount']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!'})
    }

    const _id = req.params.id
    const itemId = req.params.itemId
    try {
        // const invoice = await Invoice.findOne({_id, owner: req.user._id })
        const invoice = await Invoice.findOne({_id})
        const invoiceItem = await invoice.invoiceItemInfo.id(itemId)

        if (!invoiceItem) {
            res.status(404).send()
        }

        updates.forEach((update) => {
            invoiceItem[update] = req.body[update]
        })

        // mongoose: calling `save()` on a subdoc does **not** save the document to MongoDB, it only runs save middleware.
        // Use `subdoc.save({ suppressWarning: true })` to hide this warning if you're sure this behavior is right for your app.
        await invoiceItem.save({ suppressWarning: true })
        await invoice.save()
        res.send(invoiceItem)

    } catch (e) {
        res.status(500).send()
        console.log(e)
    }
})

// delete specific invoice
// router.delete('/invoices/:id', auth, async (req, res) => {
router.delete('/invoices/:id', async (req, res) => {
    const _id = req.params.id

    try {
        // const invoice = await Invoice.findByIdAndDelete(req.params.id)
        // const invoice = await Invoice.findOneAndDelete({ _id, owner: req.user._id})
        const invoice = await Invoice.findOneAndDelete({ _id })
        
        if (!invoice) {
            return res.status(404).send()
        }
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// router.post('/invoices/:id', auth, async (req, res, next) => {
router.post('/invoices/:id', async (req, res, next) => {
    try {
    const _id = req.params.id
    // console.log(_id)
    // const invoice = await Invoice.findOne({_id, owner: req.user._id })
    const invoice = await Invoice.findOne({_id})
    // console.log(invoice)
    
          invoice.save()
          res.status(201).send()
        } catch (e) {
        console.log(e)
    }
  })

module.exports = router