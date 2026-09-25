import { Building, BuildingCreationAttributes } from "./building.model.js";

export class BuildingRepository {
  create(data: BuildingCreationAttributes): Promise<Building> {
    return Building.create(data);
  }

  listAll(includeInactive = false): Promise<Building[]> {
    return Building.findAll({
      where: includeInactive ? undefined : { isActive: true },
      order: [["name", "ASC"]],
    });
  }

  findById(id: string): Promise<Building | null> {
    return Building.findByPk(id);
  }
}

export default BuildingRepository;
