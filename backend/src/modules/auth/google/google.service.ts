import { User } from "../../users/user.model.js";
import { signToken } from "../jwt.js";
import { GoogleUserData } from "./google.types.js";
import { LocalAuthRepository } from "../local/auth.repository.js";

export async function authenticateWithGoogle(googleUser: GoogleUserData) {
  let user = await User.findOne({
    where: {
      email: googleUser.email,
    },
    attributes: ["id", "email", "status", "googleId", "lastLoginAt"],
  });

  if (!user) {
    user = await User.create({
      email: googleUser.email,
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

  const roles = await new LocalAuthRepository().findUserRoles(user.id);
  const token = signToken({ sub: user.id, roles });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      status: user.status,
      roles,
    },
  };
}
