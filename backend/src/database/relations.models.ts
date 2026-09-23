import { User } from "../modules/users/user.model.js";
import { Role } from "../modules/roles/role.model.js";
import { Building } from "../modules/buildings/building.model.js";
import { Unit } from "../modules/units/unit.model.js";

import { UserBuildingRole } from "../modules/users-buildings-roles/user-building-role.model.js";

import { AuditLog } from "../modules/audit/audit.model.js";
import { Person } from "../modules/people/people.model.js";
import { UnitPeople } from "../modules/unit-people/unit-people.model.js";

export function setupRelations(): void {
  // User <-> UserBuildingRole
  // un usuario puede tener multiples asignaciones de rol dentro de diferentes edificios
  User.hasMany(UserBuildingRole, {
    foreignKey: "userId",
    as: "buildingRoles",
  });

  UserBuildingRole.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // Role <-> UserBuildingRole
  // un rol puede ser asignado a multiples usuarios y edificios
  Role.hasMany(UserBuildingRole, {
    foreignKey: "roleId",
    as: "userBuildingRoles",
  });

  UserBuildingRole.belongsTo(Role, {
    foreignKey: "roleId",
    as: "role",
  });

  // Building <-> UserBuildingRole
  // un edificio puede tener multiples usuarios con diferentes roles
  Building.hasMany(UserBuildingRole, {
    foreignKey: "buildingId",
    as: "userBuildingRoles",
  });

  UserBuildingRole.belongsTo(Building, {
    foreignKey: "buildingId",
    as: "building",
  });

  // User <-> Role (N:M a traves de UserBuildingRole)
  // un usuario puede tener multiples roles y un rol puede pertenecer a multiples usuarios
  User.belongsToMany(Role, {
    through: UserBuildingRole,
    foreignKey: "userId",
    otherKey: "roleId",
    as: "roles",
  });

  Role.belongsToMany(User, {
    through: UserBuildingRole,
    foreignKey: "roleId",
    otherKey: "userId",
    as: "users",
  });

  // User <-> Building (N:M a traves de UserBuildingRole)
  // un usuario puede estar asociado a multiples edificios y un edificio puede tener multiples usuarios
  User.belongsToMany(Building, {
    through: UserBuildingRole,
    foreignKey: "userId",
    otherKey: "buildingId",
    as: "buildings",
  });

  Building.belongsToMany(User, {
    through: UserBuildingRole,
    foreignKey: "buildingId",
    otherKey: "userId",
    as: "users",
  });

  // Building <-> Unit
  // un edificio tiene multiples unidades, y cada unidad pertenece a un unico edificio
  Building.hasMany(Unit, {
    foreignKey: "buildingId",
    as: "units",
  });

  Unit.belongsTo(Building, {
    foreignKey: "buildingId",
    as: "building",
  });

  // Building <-> AuditLog
  // un edificio puede tener multiples registros en la bitacora unificada
  Building.hasMany(AuditLog, {
    foreignKey: "buildingId",
    as: "auditLogs",
  });

  AuditLog.belongsTo(Building, {
    foreignKey: "buildingId",
    as: "building",
  });

  // Unit <-> AuditLog
  // una unidad puede tener multiples registros en la bitacora (campo opcional en AuditLog)
  Unit.hasMany(AuditLog, {
    foreignKey: "unitId",
    as: "auditLogs",
  });

  AuditLog.belongsTo(Unit, {
    foreignKey: "unitId",
    as: "unit",
  });

  // User <-> AuditLog
  // un usuario puede haber ejecutado multiples acciones registradas en la bitacora
  User.hasMany(AuditLog, {
    foreignKey: "performedBy",
    as: "performedAuditLogs",
  });

  AuditLog.belongsTo(User, {
    foreignKey: "performedBy",
    as: "performedByUser",
  });

  // Person <-> UnitPeople (N:M atraves de UnitPeople)
  // una persona puede estar registrada en multiples unidades y una unidad puede tener multiples personas asociadas
  Unit.hasMany(UnitPeople, {
    foreignKey: "unitId",
    as: "unitPeople",
  });

  UnitPeople.belongsTo(Unit, {
    foreignKey: "unitId",
    as: "unit",
  });

  Person.hasMany(UnitPeople, {
    foreignKey: "personId",
    as: "unitPeople",
  });

  UnitPeople.belongsTo(Person, {
    foreignKey: "personId",
    as: "person",
  });

  // Person <-> User (1 a 0..1 via users.person_id)
  // una persona puede tener a lo sumo un usuario asociado, y la FK vive en users.person_id, NO en people.
  Person.hasOne(User, {
    foreignKey: "personId",
    as: "user",
  });

  User.belongsTo(Person, {
    foreignKey: "personId",
    as: "person",
  });

  // Sprint futuro: a medida que se sumen nuevas tablas (Amenities, Reservations,
  // Deliveries, Visits, Incidents, Moves, Notifications...) agregar aca sus
  // relaciones siguiendo el mismo patron usado arriba: hasMany() del lado "padre"
  // + belongsTo() del lado "hijo", cada uno con foreignKey y as explicitos.
}
