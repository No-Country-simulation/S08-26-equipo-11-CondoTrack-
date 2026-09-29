import { Op } from "sequelize";

import { Building } from "../buildings/building.model.js";
import { Person } from "../people/people.model.js";
import { UnitPeople } from "../unit-people/unit-people.model.js";
import { Unit } from "../units/unit.model.js";
import { User } from "../users/user.model.js";
import { CreateIncidentDto, ListIncidentsDto } from "./incident.dto.js";
import { Incident } from "./incident.model.js";

export class IncidentRepository {
  findBuilding(id: string) {
    return Building.findByPk(id);
  }

  findUnit(id: string) {
    return Unit.findByPk(id);
  }

  findPerson(id: string) {
    return Person.findByPk(id);
  }

  findIncident(id: string) {
    return Incident.findByPk(id);
  }

  findActiveUnitPerson(unitId: string, personId: string, now: Date) {
    return UnitPeople.findOne({
      where: {
        unitId,
        personId,
        [Op.and]: [
          {
            [Op.or]: [
              { startDate: null },
              { startDate: { [Op.lte]: now } },
            ],
          },
          {
            [Op.or]: [
              { endDate: null },
              { endDate: { [Op.gte]: now } },
            ],
          },
        ],
      },
    });
  }

  create(
    unit: Unit,
    dto: CreateIncidentDto,
    reportedByUserId: string,
  ) {
    return Incident.create({
      buildingId: unit.buildingId,
      unitId: unit.id,
      reportedByUserId,
      assignedToPersonId: null,
      title: dto.title,
      description: dto.description,
      severity: dto.severity,
      status: "OPEN",
      resolvedAt: null,
    });
  }

  list(buildingId: string, filters: ListIncidentsDto) {
    return Incident.findAll({
      where: {
        buildingId,
        ...(filters.status ? { status: filters.status } : {}),
      },
      order: [["createdAt", "DESC"]],
    });
  }

  update(
    incident: Incident,
    data: {
      status?: Incident["status"];
      assignedToPersonId?: string | null;
      resolvedAt?: Date | null;
    },
  ) {
    return incident.update(data);
  }

  findUser(id: string) {
  return User.findByPk(id, {
    attributes: ["id", "personId"],
  });
}
}