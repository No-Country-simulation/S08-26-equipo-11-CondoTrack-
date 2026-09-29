import { User } from "../modules/users/user.model.js";
import { Role } from "../modules/roles/role.model.js";
import { Building } from "../modules/buildings/building.model.js";
import { Unit } from "../modules/units/unit.model.js";
import { UserBuildingRole } from "../modules/users-buildings-roles/user-building-role.model.js";
import { AuditLog } from "../modules/audit/audit.model.js";
import { Person } from "../modules/people/people.model.js";
import { UnitPeople } from "../modules/unit-people/unit-people.model.js";
import { AccessAuthorization } from "../modules/accesses/access-authorization.model.js";
import { AccessEvent } from "../modules/accesses/access-event.model.js";
import { CommonArea } from "../modules/common-areas/common-area.model.js";
import { Reservation } from "../modules/reservations/reservation.model.js";
import { Incident } from "../modules/incidents/incident.model.js";

export function setupRelations(): void {
  User.hasMany(UserBuildingRole, {
    foreignKey: "userId",
    as: "buildingRoles",
  });

  UserBuildingRole.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  Role.hasMany(UserBuildingRole, {
    foreignKey: "roleId",
    as: "userBuildingRoles",
  });

  UserBuildingRole.belongsTo(Role, {
    foreignKey: "roleId",
    as: "role",
  });

  Building.hasMany(UserBuildingRole, {
    foreignKey: "buildingId",
    as: "userBuildingRoles",
  });

  UserBuildingRole.belongsTo(Building, {
    foreignKey: "buildingId",
    as: "building",
  });

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

  Building.hasMany(Unit, {
    foreignKey: "buildingId",
    as: "units",
  });

  Unit.belongsTo(Building, {
    foreignKey: "buildingId",
    as: "building",
  });

  Building.hasMany(AuditLog, {
    foreignKey: "buildingId",
    as: "auditLogs",
  });

  AuditLog.belongsTo(Building, {
    foreignKey: "buildingId",
    as: "building",
  });

  Unit.hasMany(AuditLog, {
    foreignKey: "unitId",
    as: "auditLogs",
  });

  AuditLog.belongsTo(Unit, {
    foreignKey: "unitId",
    as: "unit",
  });

  User.hasMany(AuditLog, {
    foreignKey: "performedBy",
    as: "performedAuditLogs",
  });

  AuditLog.belongsTo(User, {
    foreignKey: "performedBy",
    as: "performedByUser",
  });

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

  Person.hasOne(User, {
    foreignKey: "personId",
    as: "user",
  });

  User.belongsTo(Person, {
    foreignKey: "personId",
    as: "person",
  });

  Building.hasMany(AccessAuthorization, {
    foreignKey: "buildingId",
    as: "accessAuthorizations",
  });

  AccessAuthorization.belongsTo(Building, {
    foreignKey: "buildingId",
    as: "building",
  });

  Building.hasMany(CommonArea, {
    foreignKey: "buildingId",
    as: "commonAreas",
  });

  CommonArea.belongsTo(Building, {
    foreignKey: "buildingId",
    as: "building",
  });

  Unit.hasMany(AccessAuthorization, {
    foreignKey: "unitId",
    as: "accessAuthorizations",
  });

  AccessAuthorization.belongsTo(Unit, {
    foreignKey: "unitId",
    as: "unit",
  });

  Person.hasMany(AccessAuthorization, {
    foreignKey: "visitorId",
    as: "accessAuthorizations",
  });

  AccessAuthorization.belongsTo(Person, {
    foreignKey: "visitorId",
    as: "visitor",
  });

  User.hasMany(AccessAuthorization, {
    foreignKey: "authorizedByUserId",
    as: "authorizedAccessAuthorizations",
  });

  AccessAuthorization.belongsTo(User, {
    foreignKey: "authorizedByUserId",
    as: "authorizedBy",
  });

  Building.hasMany(Reservation, {
    foreignKey: "buildingId",
    as: "reservations",
  });

  Reservation.belongsTo(Building, {
    foreignKey: "buildingId",
    as: "building",
  });

  CommonArea.hasMany(Reservation, {
    foreignKey: "commonAreaId",
    as: "reservations",
  });

  Reservation.belongsTo(CommonArea, {
    foreignKey: "commonAreaId",
    as: "commonArea",
  });

  Unit.hasMany(Reservation, {
    foreignKey: "unitId",
    as: "reservations",
  });

  Reservation.belongsTo(Unit, {
    foreignKey: "unitId",
    as: "unit",
  });

  User.hasMany(Reservation, {
    foreignKey: "requestedByUserId",
    as: "requestedReservations",
  });

  Reservation.belongsTo(User, {
    foreignKey: "requestedByUserId",
    as: "requestedByUser",
  });

  Building.hasMany(Incident, {
    foreignKey: "buildingId",
    as: "incidents",
  });

  Incident.belongsTo(Building, {
    foreignKey: "buildingId",
    as: "building",
  });

  Unit.hasMany(Incident, {
    foreignKey: "unitId",
    as: "incidents",
  });

  Incident.belongsTo(Unit, {
    foreignKey: "unitId",
    as: "unit",
  });

  User.hasMany(Incident, {
    foreignKey: "reportedByUserId",
    as: "reportedIncidents",
  });

  Incident.belongsTo(User, {
    foreignKey: "reportedByUserId",
    as: "reportedBy",
  });

  Person.hasMany(Incident, {
    foreignKey: "assignedToPersonId",
    as: "assignedIncidents",
  });

  Incident.belongsTo(Person, {
    foreignKey: "assignedToPersonId",
    as: "assignedTo",
  });

  Building.hasMany(AccessEvent, {
    foreignKey: "buildingId",
    as: "accessEvents",
  });

  AccessEvent.belongsTo(Building, {
    foreignKey: "buildingId",
    as: "building",
  });

  Unit.hasMany(AccessEvent, {
    foreignKey: "unitId",
    as: "accessEvents",
  });

  AccessEvent.belongsTo(Unit, {
    foreignKey: "unitId",
    as: "unit",
  });

  Person.hasMany(AccessEvent, {
    foreignKey: "visitorId",
    as: "accessEvents",
  });

  AccessEvent.belongsTo(Person, {
    foreignKey: "visitorId",
    as: "visitor",
  });

  AccessAuthorization.hasMany(AccessEvent, {
    foreignKey: "authorizationId",
    as: "accessEvents",
  });

  AccessEvent.belongsTo(AccessAuthorization, {
    foreignKey: "authorizationId",
    as: "authorization",
  });

  User.hasMany(AccessEvent, {
    foreignKey: "registeredByUserId",
    as: "registeredAccessEvents",
  });

  AccessEvent.belongsTo(User, {
    foreignKey: "registeredByUserId",
    as: "registeredBy",
  });
}
