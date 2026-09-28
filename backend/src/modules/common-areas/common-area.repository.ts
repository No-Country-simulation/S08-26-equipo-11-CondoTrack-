import { Building } from "../buildings/building.model.js";
import { CreateCommonAreaDto } from "./common-area.dto.js";
import { CommonArea } from "./common-area.model.js";

export class CommonAreaRepository {
  findBuilding(id: string) {
    return Building.findByPk(id);
  }

  create(buildingId: string, dto: CreateCommonAreaDto) {
    return CommonArea.create({
      buildingId,
      ...dto,
      description: dto.description ?? null,
    });
  }

  list(buildingId: string) {
    return CommonArea.findAll({
      where: {
        buildingId,
        isActive: true,
      },
      order: [["name", "ASC"]],
    });
  }
}
