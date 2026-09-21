import { User } from "../../users/user.model.js";
import { signToken } from "../jwt.js";
import { GoogleUserData } from "./google.types.js";

export async function authenticateWithGoogle(
  googleUser: GoogleUserData,
) {
  let user = await User.findOne({
    where: {
      email: googleUser.email,
    },
  });

  if (!user) {
    user = await User.create({
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
      documentType: null,
      documentNumber: null,
      email: googleUser.email,
      phone: null,
      passwordHash: null,
      googleId: googleUser.googleId,
      status: "ACTIVE",
      lastLoginAt: new Date(),
    });
  } else {
    user.googleId = googleUser.googleId;
    user.lastLoginAt = new Date();

    await user.save();
  }

  const token = signToken({
    sub: user.id,
  });

  return {
    user,
    token,
  };
}