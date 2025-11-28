const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchma = new Schema (
    {
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        body: {type: String, required: true}
    },
    {
        timestamps : true
    }
)

const Comment = mongoose.model('Comment', commentSchma);
const postSchema = new Schema(
    {
        chef : {type: Schema.Types.ObjectId, ref: 'User'},
        title : {type: String, required: true},
        description: {type: String, required: true},
        urlToImage : {type: String, required: true},
        likes : [{type: Schema.Types.ObjectId, ref: 'User'}],
        comments : [{type: Schema.Types.ObjectId, ref: 'Comment'}]
    },
    {
        timestamps : true
    }
);

postSchema.virtual("likeCount").get(function () {
  return this.likes?.length || 0;
});

postSchema.virtual("commentCount").get(function () {
  return this.comments?.length || 0;
});

// Ensure virtuals are included in JSON output
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

postSchema.pre('deleteOne',{document: true, query : false}, async function(){
    const comments = this.comments;
    await Comment.deleteMany({ _id : { $in: comments}});
});

const Post = mongoose.model('Post', postSchema);

module.exports = { Comment, Post};