import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { NurseEntity } from "./nurse.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityNotFoundError } from "typeorm";
import { Preference } from "../shiftPreference/shift-preference.types";
import {
  ShiftPreferences,
  PreferenceValidationError,
  PreferenceParseError,
} from "../shiftPreference/shift-preference.model";

@Injectable()
export class NurseService {
  constructor(
    @InjectRepository(NurseEntity)
    private nurseRepository: Repository<NurseEntity>
  ) {}

  async getNurses(): Promise<NurseEntity[]> {
    return this.nurseRepository.find();
  }

  async getPreferences(id: number): Promise<Preference[]> {
    const nurse = await this.findNurseOrFail(id);

    // If the nurse has no preferences, return an empty array
    if (nurse.preferences === null) {
      return [];
    }

    // This takes the value from the database, and validates it as a valid Preference[]
    const shiftPreferences = new ShiftPreferences(nurse.preferences);
    return shiftPreferences.getPreferences();
  }

  async setPreferences(
    id: number,
    preferences: Preference[] | null
  ): Promise<NurseEntity> {
    const nurse = await this.findNurseOrFail(id);
    return this.setShiftPreferences(nurse, preferences);
  }

  private async findNurseOrFail(id: number): Promise<NurseEntity> {
    try {
      return await this.nurseRepository.findOneByOrFail({ id });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          `Nurse with ID ${id} was not found in the database`
        );
      }
      throw error;
    }
  }

  private async setShiftPreferences(
    nurse: NurseEntity,
    preferences: Preference[] | null
  ): Promise<NurseEntity> {
    // if the preferences are null or an empty array, we save null to the database
    if (preferences === null || preferences.length === 0) {
      return this.nurseRepository.save({ ...nurse, preferences: null });
    }

    if (preferences.length < 3) {
      throw new BadRequestException(
        `Failed to set preferences on nurse with id ${nurse.id}: You must set atleast 3 preferences`
      );
    }

    try {
      // the constructor validates the preferences and ensures that they are an array of valid Preference objects
      // While this may be overkill for this use case whenever your saving JSON to the database you need to be extra careful and ensure you do not break the data contract
      const shiftPreferencesHandler = new ShiftPreferences(preferences);
      return this.nurseRepository.save({
        ...nurse,
        preferences: shiftPreferencesHandler.getPreferences(),
      });
    } catch (error) {
      if (error instanceof PreferenceParseError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof PreferenceValidationError) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new BadRequestException(
        `Failed to set preferences on nurse with id ${nurse.id}`
      );
    }
  }
}
