import mongoose from "mongoose";

/**
 * Stores revoked JWT tokens until they naturally expire.
 * The TTL index ensures documents are auto-deleted by MongoDB once the token
 * expiry time passes — keeping the collection small with zero maintenance.
 */
const tokenBlocklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  // The exact moment the JWT itself expires — MongoDB will auto-delete this
  // document at that time via the TTL index.
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL: delete when current time >= expiresAt
  },
});

export default mongoose.model("TokenBlocklist", tokenBlocklistSchema);
