import AppError from "../../utils/AppError.js";
import { CreateBuildingDto } from "./create-building.dto.js";
import { Building } from "./building.model.js";
import { BuildingRepository } from "./building.repository.js";

export class BuildingService {
  constructor(private readonly buildingRepository: BuildingRepository) {}

  async create(dto: CreateBuildingDto): Promise<Building> {
    return this.buildingRepository.create(dto);
  }

  async list(includeInactive = false): Promise<Building[]> {
    return this.buildingRepository.listAll(includeInactive);
  }

  async getById(id: string): Promise<Building> {
    const building = await this.buildingRepository.findById(id);

    if (!building) {
      throw new AppError("Edificio no encontrado", 404);
    }

    return building;
  }
}
