import { Building } from "./building.model.js";
import { CreateBuildingDto } from "./create-building.dto.js";

export class BuildingService {
  async create(dto: CreateBuildingDto): Promise<Building> {
    return Building.create({
      name: dto.name,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      numberOfFloors: dto.numberOfFloors,
      numberOfUnits: dto.numberOfUnits,
      zipCode: dto.zipCode ?? null,
      description: dto.description ?? null,
      isActive: true,
    });
  }
}