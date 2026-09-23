import { Building, BuildingCreationAttributes } from "./building.model.js";

export class BuildingRepository {
  create(data: BuildingCreationAttributes): Promise<Building> {
    return Building.create(data);
  }

  listAll(): Promise<Building[]> {
    return Building.findAll({
      order: [["name", "ASC"]],
    });
  }

  findById(id: string): Promise<Building | null> {
    return Building.findByPk(id);
  }
}

export default BuildingRepository;
