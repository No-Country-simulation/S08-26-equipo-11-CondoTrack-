import { Op, WhereOptions } from "sequelize";

import { Building, BuildingCreationAttributes } from "./building.model.js";
import { UpdateBuildingDto } from "./update-building.dto.js";

export class BuildingRepository {
  create(data: BuildingCreationAttributes): Promise<Building> {
    return Building.create(data);
  }

  listAll(
    includeInactive = false,
    buildingIds: string[] | null = null,
  ): Promise<Building[]> {
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

  async update(id: string, data: UpdateBuildingDto): Promise<Building | null> {
    const building = await Building.findByPk(id);

    return building ? building.update(data) : null;
  }
}

export default BuildingRepository;
