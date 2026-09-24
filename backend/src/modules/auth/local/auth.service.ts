import bcrypt from "bcrypt";
import { UniqueConstraintError } from "sequelize";

import { sequelize } from "../../../database/database.js";
import AppError from "../../../utils/AppError.js";
import { RESIDENT_ROLE } from "../../roles/role.types.js";
import { Person } from "../../people/people.model.js";
import { signToken, JwtRole } from "../jwt.js";
import { LoginUserDto } from "./login.dto.js";
import { RegisterDto } from "./register.dto.js";
import { LocalAuthRepository } from "./auth.repository.js";

const BCRYPT_ROUNDS = 10;
const INVALID_CREDENTIALS_MESSAGE = "Email o contraseña incorrectos";

export interface RegisterResultRole {
  roleId: string;
  buildingId: string;
  roleName: string;
}

export interface RegisterResult {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: RegisterResultRole[];
  };
  token: string;
}

export interface LoginResult {
  user: {
    id: string;
    email: string;
    roles: JwtRole[];
  };
  token: string;
}

export class LocalAuthService {
  constructor(private readonly authRepository: LocalAuthRepository) {}

  async register(dto: RegisterDto): Promise<RegisterResult> {
    const email = dto.email.trim().toLowerCase();

    const existing = await this.authRepository.findUserByEmail(email);
    if (existing) {
      throw new AppError("El email ya está registrado", 409);
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const { user, residentRoleId } = await sequelize
      .transaction(async (transaction) => {
        const residentRole = await this.authRepository.findRoleByName(
          RESIDENT_ROLE,
          transaction,
        );
        if (!residentRole) {
          throw new AppError("El rol RESIDENT no está configurado", 500);
        }

        const person = await this.authRepository.createPerson(
          {
            firstName: dto.firstName,
            lastName: dto.lastName,
            documentType: dto.documentType,
            documentNumber: dto.documentNumber,
            email,
            phone: dto.phone,
          },
          transaction,
        );

        const user = await this.authRepository.createUser(
          {
            personId: person.id,
            email,
            passwordHash,
            status: "ACTIVE",
            lastLoginAt: null,
          },
          transaction,
        );

        await this.authRepository.createUserBuildingRole(
          {
            userId: user.id,
            roleId: residentRole.id,
            buildingId: dto.buildingId,
          },
          transaction,
        );

        return { user, residentRoleId: residentRole.id };
      })
      .catch((error) => {
        if (error instanceof UniqueConstraintError) {
          const constraint = (error.parent as any)?.constraint ?? "";
          if (constraint.includes("email")) {
            throw new AppError("El email ya está registrado", 409);
          }
          if (constraint.includes("document_number")) {
            throw new AppError("El documento ya está registrado", 409);
          }
          throw new AppError("Ya existe un registro duplicado", 409);
        }
        throw error;
      });

    await user.reload({
      include: [{ model: Person, as: "person" }],
    });

    const token = signToken({ sub: user.id });

    return {
      user: {
        id: user.id,
        firstName: user.person?.firstName ?? "",
        lastName: user.person?.lastName ?? "",
        email: user.email,
        roles: [
          {
            roleId: residentRoleId,
            buildingId: dto.buildingId,
            roleName: RESIDENT_ROLE,
          },
        ],
      },
      token,
    };
  }

  async login(dto: LoginUserDto): Promise<LoginResult> {
    const user = await this.authRepository.findUserByEmail(dto.email, {
      includePasswordHash: true,
    });

    if (!user) {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401);
    }
    const passwordMatches = user.passwordHash
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : false;

    if (!passwordMatches) {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401);
    }
    if (user.status !== "ACTIVE") {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401);
    }

    const roles = await this.authRepository.findUserRoles(user.id);
    if (roles.length === 0) {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401);
    }

    await this.authRepository.updateLastLoginAt(user.id);

    const token = signToken({ sub: user.id, roles });

    return {
      user: {
        id: user.id,
        email: user.email,
        roles,
      },
      token,
    };
  }
}
