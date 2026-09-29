import { sequelize } from "../../../database/database.js";
import { Person } from "../../people/people.model.js";
import { User } from "../../users/user.model.js";
import { signToken } from "../jwt.js";
import { LocalAuthRepository } from "../local/auth.repository.js";
import { GoogleUserData } from "./google.types.js";

export async function authenticateWithGoogle(googleUser: GoogleUserData) {
  let user = await User.findOne({
    where: {
      email: googleUser.email,
    },
    attributes: ["id", "email", "status", "googleId", "lastLoginAt"],
  });

  if (!user) {
    user = await sequelize.transaction(async (transaction) => {
      const person = await Person.create(
        {
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          email: googleUser.email,
        },
        { transaction },
      );

      return User.create(
        {
          personId: person.id,
          email: googleUser.email,
          passwordHash: null,
          googleId: googleUser.googleId,
          status: "ACTIVE",
          lastLoginAt: new Date(),
        },
        { transaction },
      );
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
