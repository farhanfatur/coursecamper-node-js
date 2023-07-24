const mongoose = require('mongoose')
const slugify = require('slugify')
const openGeocoder = require('node-open-geocoder')

const BootcampSchema = new mongoose.Schema({
    user: {
        type: String
    },
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not more than 50 characters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot more than 500 characters']
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please add a email'],
        maxlength: [20, 'Phone number can not be longer than 20 characters']
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    address: {
        type: String,
        required: [true, 'Please add a address']
    },
    location: {
        type: {
            type: String,
            enum: ['Point', 'Polygon']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        postcode: String,
        country: String
    },
    careers: {
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must can not be more than 10']
    },
    averageCost: Number,
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

BootcampSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true })
    this.location = undefined
    openGeocoder().geocode(this.address).end((err, res) => {
        this.location = {
            type: "Point",
            coordinates: [res[0].lon, res[0].lat],
            formattedAddress: res[0].display_name,
            street: res[0].address.road,
            city: res[0].address.city,
            state: res[0].address.state,
            postcode: res[0].address.postcode,
            country: res[0].address.country,
        }
        this.address = undefined
        next()
    })
})

BootcampSchema.pre('remove', async function(next) {
    console.log(`Course being remove from bootcamp ${this._id}`)
    await this.model('Course').deleteMany({ bootcamp: this._id })
    next()
})

BootcampSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
})

module.exports = mongoose.model('Bootcamp', BootcampSchema)