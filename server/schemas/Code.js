const mongoose = require("mongoose");

const codeSchema = new mongoose.Schema({
  userCode: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Code = mongoose.model("Code", codeSchema);

module.exports = Code;
