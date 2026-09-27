import { Op, WhereOptions } from "sequelize";

import { Building, BuildingCreationAttributes } from "./building.model.js";

export class BuildingRepository {
  create(data: BuildingCreationAttributes): Promise<Building> {
    return Building.create(data);
  }

  /**
   * buildingIds null = sin filtro de alcance (SUPER_ADMIN).
   * Un array, incluso vacio, acota el resultado a esos edificios.
   */
  listAll(includeInactive = false, buildingIds: string[] | null = null): Promise<Building[]> {
    const where: WhereOptions<Building> = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (buildingIds) {
      where.id = { [Op.in]: buildingIds };
    }

    return Building.findAll({
      where: Object.keys(where).length > 0 ? where : undefined,
      order: [["name", "ASC"]],
    });
  }

  findById(id: string): Promise<Building | null> {
    return Building.findByPk(id);
  }
}

export default BuildingRepository;
