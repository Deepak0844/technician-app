import mongoose from "mongoose";

/**
 * One document per issued refresh token. Only a SHA-256 hash of the token is
 * stored. Tokens are rotated on every use: the old document is kept with
 * `usedAt` set so a replayed token can be detected and its whole `familyId`
 * (one login session) revoked. The TTL index removes documents after expiry.
 */
const refreshTokenSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  familyId: { type: String, required: true, index: true },
  usedAt: { type: Date, default: null },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL: delete when current time >= expiresAt
  },
});

export default mongoose.model("RefreshToken", refreshTokenSchema);
