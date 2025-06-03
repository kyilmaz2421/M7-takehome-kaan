import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { NurseService } from "./nurse.service";
import { NurseEntity } from "./nurse.entity";
import { Preference } from "../shiftPreference/shift-preference.types";

@Controller("nurses")
export class NurseController {
  constructor(private readonly nurseService: NurseService) {}

  @Get()
  async getNurses(): Promise<NurseEntity[]> {
    return this.nurseService.getNurses();
  }

  @Get("/:id/preferences")
  async getPreferences(@Param("id") id: number): Promise<Preference[]> {
    return this.nurseService.getPreferences(id);
  }

  @Post("/:id/preferences")
  async setPreferences(
    @Param("id") id: number,
    @Body("preferences") preferences: Preference[] | null
  ): Promise<any> {
    return this.nurseService.setPreferences(id, preferences);
  }
}
