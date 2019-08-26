const express = require('express')
const Invoice = require('../models/invoice')
const router = new express.Router()
const uniqid = require('uniqid')
const auth = require('../middleware/auth')


// create new invoice
router.post('/invoices', auth, async (req, res) => {
// router.post('/invoices', async (req, res) => {
    // console.log(req.body)
    const invoiceNumber = uniqid.process()
    const owner = req.user._id
    // console.log(invoiceNumber)
    const invoice = new Invoice({
        // add owner to body
        ...req.body,
        owner,
        invoiceNumber,// this value comes from the user const defined in the auth middleware
    })
    // console.log(owner)
    try {
        await invoice.save()
        res.status(201).send(invoice)
        //console.log(req.body)
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

// get all created invoices (no auth)
// router.get('/invoices', async (req, res) => {
//     try {
//         const invoices = await Invoice.find({})
//         res.status(200).send(invoices)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

router.get('/invoices', auth, async (req, res) => {
    try {
        // const invoices = await Invoice.find({ owner: req.user_id })
        await req.user.populate('invoices').execPopulate()
        res.send(req.user.invoices)
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

// update specific invoice for invoice due date info and invoice status
router.patch('/invoices/:id', auth, async (req, res) => {
    // router.patch('/invoices/:id', async (req, res) => {
        const updates = Object.keys(req.body)
        const allowedUpdates = [
            'invoiceDueDateInfo',
            'invoiceStatus'
        ]
        const isValidOperation = updates.every((update) => {
            return allowedUpdates.includes(update)
        })
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!'})
        }
    
        const _id = req.params.id
        try {
            const invoice = await Invoice.findOne({_id, owner: req.user._id })
            // const invoice = await Invoice.findOne({_id})
    
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
// update specific invoice for client info
router.patch('/invoices/:id/clientinfo', auth, async (req, res) => {
// router.patch('/invoices/:id/clientinfo', async (req, res) => {
    const updates = Object.keys(req.body)
    // we are only allowed to update properties in the clientInfo object
    const allowedUpdates = [
        'clientName',
        'amountPaid',
        'clientPhoneNumber',
        'clientEmail']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!'})
    }

    const _id = req.params.id
    try {
        const invoice = await Invoice.findOne({_id, owner: req.user._id })
        // const invoice = await Invoice.findOne({_id})

        if (!invoice) {
            res.status(404).send()
        }

        updates.forEach((update) => {
            // we need to go into the clientInfo object of the invoice model
            // to apply the updates to the clientInfo
            // this is necessary because clientInfo is nested, and we are 
            // making changes to the nested properties
            invoice.clientInfo[update] = req.body[update]
        })
        await invoice.save()
        res.send(invoice)

    } catch (e) {
        res.status(500).send()
        console.log(e)
    }
})

// update specific invoice for company info
router.patch('/invoices/:id/companyinfo', auth, async (req, res) => {
    // router.patch('/invoices/:id/companyinfo', async (req, res) => {
        const updates = Object.keys(req.body)
        // we are only allowed to update properties in the companyInfo object
        const allowedUpdates = [
            'companyName',
            'companyBankName',
            'companyAccountNumber',
            'companyBankAccountName',
            'companyPhoneNumber',
            'companyEmail'
        ]
        const isValidOperation = updates.every((update) => {
            return allowedUpdates.includes(update)
        })
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!'})
        }
    
        const _id = req.params.id
        try {
            const invoice = await Invoice.findOne({_id, owner: req.user._id })
            // const invoice = await Invoice.findOne({_id})
    
            if (!invoice) {
                res.status(404).send()
            }
    
            updates.forEach((update) => {
                // we need to go into the companyInfo object of the invoice model
                // to apply the updates to the companyInfo
                // this is necessary because companyInfo is nested, and we are 
                // making changes to the nested properties
                invoice.companyInfo[update] = req.body[update]
            })
            await invoice.save()
            res.send(invoice)
    
        } catch (e) {
            res.status(500).send()
            console.log(e)
        }
    })

//update specific invoice item
router.patch('/invoices/:id/items/:itemId', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = [
        'itemDescription',
        'itemCategory',
        'itemPrice',
        'itemQuantity']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!'})
    }

    const _id = req.params.id
    const itemId = req.params.itemId
    try {
        const invoice = await Invoice.findOne({_id, owner: req.user._id })
        // const invoice = await Invoice.findOne({_id})
        const invoiceItem = await invoice.invoiceItemInfo.id(itemId)

        if (!invoiceItem) {
            res.status(404).send()
        }

        updates.forEach((update) => {
            invoiceItem[update] = req.body[update]
        })

        // mongoose: calling `save()` on a subdoc does **not** save the document to MongoDB, it only runs save middleware.
        // Use `subdoc.save({ suppressWarning: true })` to hide this warning if you're sure this behavior is right for your app.

        // first save to the subdoc
        await invoiceItem.save({ suppressWarning: true })
        // then save to the invoice which then gets updated with the recently saved subdoc
        await invoice.save()
        res.send(invoiceItem)

    } catch (e) {
        res.status(500).send()
        console.log(e)
    }
})

//update specific terms and conditions item
router.patch('/invoices/:id/termsandconditions/:itemId', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = [
        'termDescription'
    ]
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!'})
    }

    const _id = req.params.id
    const itemId = req.params.itemId
    try {
        const invoice = await Invoice.findOne({_id, owner: req.user._id })
        // const invoice = await Invoice.findOne({_id})
        const tandCItem = await invoice.termsAndConditions.id(itemId)

        if (!tandCItem) {
            res.status(404).send()
        }

        updates.forEach((update) => {
            tandCItem[update] = req.body[update]
        })

        // mongoose: calling `save()` on a subdoc does **not** save the document to MongoDB, it only runs save middleware.
        // Use `subdoc.save({ suppressWarning: true })` to hide this warning if you're sure this behavior is right for your app.
        await tandCItem.save({ suppressWarning: true })
        await invoice.save()
        res.send(tandCItem)

    } catch (e) {
        res.status(500).send()
        console.log(e)
    }
})

// delete specific invoice
// router.delete('/invoices/:id', auth, async (req, res) => {
router.delete('/invoices/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        // const invoice = await Invoice.findByIdAndDelete(req.params.id)
        const invoice = await Invoice.findOneAndDelete({ _id, owner: req.user._id})
        // const invoice = await Invoice.findOneAndDelete({ _id })
        
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