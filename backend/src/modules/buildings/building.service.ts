import AppError from "../../utils/AppError.js";
import { CreateBuildingDto } from "./create-building.dto.js";
import { Building } from "./building.model.js";
import { BuildingRepository } from "./building.repository.js";
import { UpdateBuildingDto } from "./update-building.dto.js";

export class BuildingService {
  constructor(private readonly buildingRepository: BuildingRepository) {}

  async create(dto: CreateBuildingDto): Promise<Building> {
    return this.buildingRepository.create(dto);
  }

  async list(
    includeInactive = false,
    buildingIds: string[] | null = null,
  ): Promise<Building[]> {
    return this.buildingRepository.listAll(includeInactive, buildingIds);
  }

  async getById(id: string): Promise<Building> {
    const building = await this.buildingRepository.findById(id);

    if (!building) {
      throw new AppError("Edificio no encontrado", 404);
    }

    return building;
  }

  async update(id: string, data: UpdateBuildingDto): Promise<Building> {
    const building = await this.buildingRepository.update(id, data);

    if (!building) {
      throw new AppError("Edificio no encontrado", 404);
    }

    return building;
  }
}
