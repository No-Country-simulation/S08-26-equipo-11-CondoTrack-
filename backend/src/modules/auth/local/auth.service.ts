import bcrypt from "bcrypt";
import { UniqueConstraintError } from "sequelize";

import { sequelize } from "../../../database/database.js";
import AppError from "../../../utils/AppError.js";
import { RESIDENT_ROLE } from "../../roles/role.types.js";
import { signToken, JwtRole } from "../jwt.js";
import { LoginUserDto } from "./login.dto.js";
import { RegisterDto } from "./register.dto.js";
import { LocalAuthRepository } from "./auth.repository.js";

const BCRYPT_ROUNDS = 10; //hasheo de contraseña
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

  // POST /api/auth/register
  async register(dto: RegisterDto): Promise<RegisterResult> {
    const email = dto.email.trim().toLowerCase();

    //chequear que no este ya en DB
    const existing = await this.authRepository.findUserByEmail(email);
    if (existing) {
      throw new AppError("El email ya está registrado", 409);
    }

    //hashear la pass
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    //crear el usuario desde el repository y asignarle el rol default RESIDENT
    const { user, residentRoleId } = await sequelize
      .transaction(async (transaction) => {
        const residentRole = await this.authRepository.findRoleByName(
          RESIDENT_ROLE,
          transaction,
        );
        if (!residentRole) {
          throw new AppError("El rol RESIDENT no está configurado", 500);
        }

        const user = await this.authRepository.createUser(
          {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email,
            documentType: dto.documentType,
            documentNumber: dto.documentNumber,
            phone: dto.phone,
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

    const token = signToken({ sub: user.id });

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
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

  //POST /api/auth/login
  async login(dto: LoginUserDto): Promise<LoginResult> {
    const user = await this.authRepository.findUserByEmail(dto.email, {
      includePasswordHash: true,
    });

    if (!user) {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401);
    }
    //verificar que la contraseña coincida con la de DB
    const passwordMatches = user.passwordHash
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : false;

    if (!passwordMatches) {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401);
    }

    //verificar roles asignados del usuario
    const roles = await this.authRepository.findUserRoles(user.id);
    if (roles.length === 0) {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401);
    }

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
