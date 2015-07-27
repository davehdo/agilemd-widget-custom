// app/models/nerd.js
// grab the mongoose module
var mongoose = require('mongoose');

// define our nerd model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('Document', {
    fileId: String,
    fileType: String,
    versionId: String,
    meta: {
            attribution: String,
            keywords: String,
            modified: Date,
            textDirection: String,
            textLanguage: String,
            title: String
        },
    data: {
        sections: [{
            title: String,
            content: String
        }]
    },
    rel: {
        embedded: [{
            id: String,
            fileId: String,
            fileType: String,
            url: String
        }],
        affiliated: [{
            id: String,
            fileId: String,
            fileType: String,
            url: String
        }],
    },
    search: {
        boost: Number,
        source: [{
            input: String,
            level: Number
        }]
    }
});
