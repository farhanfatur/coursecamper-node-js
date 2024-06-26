const mongoose = require("mongoose")

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, "Please add review title"],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, "Please add some text"]
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, "Please add a rating for review beetween 1 to 10"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: "Bootcamp",
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    }
})

// Review only get from one user only per bootcamp
ReviewSchema.index({bootcamp: 1, user: 1}, {unique: true})

// Calculate average rating review
ReviewSchema.statics.getAverateRating = async function(bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: "$bootcamp",
                averageRating: { $avg: "$rating" }
            }
        }
    ])

    try {
        await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
            averageRating: obj[0].averageRating 
        })
    } catch (error) {
        console.error("Review model: ", error)
    }
}
 
// After Save
ReviewSchema.post("save", function() {
    this.constructor.getAverateRating(this.bootcamp)
})

// Before Delete
ReviewSchema.pre("remove", function() {
    this.constructor.getAverateRating(this.bootcamp)
})

module.exports = mongoose.model("Review", ReviewSchema)