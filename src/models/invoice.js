// note here invoice refers to the invoices created by the client
// invoice here is defines the invoice model
const mongoose = require('mongoose')

// define the invoice schema
const invoiceSchema = new mongoose.Schema(
    {
        clientInfo: {
            clientName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        }, clientPhoneNumber: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        }, 
            amountPaid: {
            type: String,
            required: true, 
            trim: true
        },
            clientEmail: {
            type: String,
            trim: true
            }
    },
        companyInfo: {
        companyName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        companyBankName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        companyBankAccountName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        companyAccountNumber: {
            type: String,
            required: true,
            trim: true,
        },
        companyPhoneNumber: {
            type: String,
            required: true,
            trim: true
        },
        companyEmail: {
            type: String,
            required: true,
            trim: true
        }},
        // create array of items (for cases where an invoice should have more than one item)
        invoiceItemInfo: [{
            itemDescription: {
                type: String,
                required: true,
                trim: true,
                lowercase: true
            },
            itemCategory: {
                type: String,
                required: true,
                trim: true,
                lowercase: true
            },
            itemPrice: {
                type: String,
                required: true,
                trim: true,
                lowercase: true
            },
            itemQuantity: {
                type: String,
                required: true,
                trim: true,
                lowercase: true
            }
        }],
        termsAndConditions: [{
            termDescription: {
                type: String,
                // required: true,
                trim: true,
                lowercase: true
            }
        }],
        invoiceNumber: {
            type: String
        },
        invoiceDueDateInfo: {
            type: Date
        },
        invoiceStatus: {
            type: String
        }//,
        // stores the id of who created the invoice
        // owner: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     required: true,
        //     ref: 'User' // this helps link the User and Invoice models
        //     // User is the name of the module exported from the User model
        // }
    }, { 
        timestamps: true 
    }
)

// specify the middleware.
// this tells the route what do with the specified field / req before sending
// back a response
invoiceSchema.pre('save', async function (next) {
    const invoice = this

    // here we are simply multiplying phoneNumber by 2 and 
    // as a result, what ever the user enters is multiplied by 2 in the response
    // that is, we are multiplying the req by 2 to get the res
    // if (invoice.isModified('phoneNumber')) {
    //     invoice.phoneNumber = await '+234'.concat(invoice.phoneNumber)
    //     // console.log(invoice.items.itemPrice)
    // }

    next()
})

// invoices invoice model and schema
const Invoice = mongoose.model('Invoice', invoiceSchema)

module.exports = Invoice