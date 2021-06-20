import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Profile } from "../entity/Profile";
import { AuthMiddleware } from "../middlewares/authMiddleware";
import { RequestResponseExpress } from "../types";

@ObjectType()
export class ErrorField {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
export class ProfileResponse {
  @Field(() => Profile, { nullable: true })
  profile?: Profile;
  @Field(() => ErrorField, { nullable: true })
  errorFeilds?: ErrorField[];
}

@Resolver()
export class ProfileResolver {
  // CREATE PROFILE
  @Mutation(() => ProfileResponse)
  @UseMiddleware(AuthMiddleware)
  async createProfile(
    @Ctx() { req }: RequestResponseExpress,
    @Arg("salary") salary: number,
    @Arg("timeLeftToNextSalary") timeLeftToNextSalary: string,
    @Arg("saving", { defaultValue: 0 }) saving?: number,
    @Arg("bills", { defaultValue: 0 }) bills?: number
  ): Promise<ProfileResponse> {
    if (!salary) {
      return {
        errorFeilds: [{ field: "salary", message: "Please enter salary!" }],
      };
    } else if (!timeLeftToNextSalary) {
      return {
        errorFeilds: [
          {
            field: "timeLeftToNextSalary",
            message: "Please provide date so I can do the math!!!",
          },
        ],
      };
    } else if (!timeLeftToNextSalary && !salary) {
      return {
        errorFeilds: [
          { field: "salary", message: "Please enter salary!" },
          {
            field: "timeLeftToNextSalary",
            message: "Please provide date so I can do the math!!!",
          },
        ],
      };
    }
    const profile = new Profile();
    profile.salary = salary;
    profile.timeLeftToNextSalary = new Date(timeLeftToNextSalary);
    profile.saving = saving;
    profile.bills = bills;

    await profile.save();
    req.user.profile = profile;
    req.user.save();
    return { profile };
  }

  // UPDATE PROFILE
  @Mutation(() => ProfileResponse)
  @UseMiddleware(AuthMiddleware)
  async updateProfile(
    @Ctx() { req }: RequestResponseExpress,
    @Arg("salary", { nullable: true }) salary: number,
    @Arg("timeLeftToNextSalary", { nullable: true })
    timeLeftToNextSalary: string,
    @Arg("saving", { nullable: true }) saving: number,
    @Arg("bills", { nullable: true }) bills: number
  ): Promise<ProfileResponse> {
    const profile = req.user.profile;
    if (salary) {
      profile.salary = salary;
    }
    if (timeLeftToNextSalary) {
      profile.timeLeftToNextSalary = new Date(timeLeftToNextSalary);
    }
    if (saving) {
      profile.saving = saving;
    }
    if (bills) {
      profile.bills = bills;
    }
    await Profile.save(profile);
    return {
      profile,
    };
  }
}
