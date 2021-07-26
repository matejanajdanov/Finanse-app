import {
  UseMiddleware,
  ObjectType,
  Mutation,
  Resolver,
  Field,
  Arg,
  Ctx,
} from "type-graphql";

import { AuthMiddleware } from "../middlewares/authMiddleware";
import { RequestResponseExpress } from "../types";
import { Profile } from "../entity/Profile";
import { Expense } from "../entity/Expense";

@ObjectType()
export class ProfileError {
  @Field()
  field: "salary" | "timeLeftToNextSalary" | "firstName" | "lastName";
  @Field()
  message: string;
}

@ObjectType()
export class ProfileResponse {
  @Field(() => Profile, { nullable: true })
  profile?: Profile;
  @Field(() => [ProfileError], { nullable: true })
  errorFeilds?: ProfileError[];
}

@Resolver()
export class ProfileResolver {
  // CREATE PROFILE
  @UseMiddleware(AuthMiddleware)
  @Mutation(() => ProfileResponse)
  async createProfile(
    @Ctx() { req }: RequestResponseExpress,
    @Arg("firstName") firstName: string,
    @Arg("lastName") lastName: string,
    @Arg("salary") salary: number,
    @Arg("timeLeftToNextSalary") timeLeftToNextSalary: string,
    @Arg("currentBalance", { nullable: true }) currentBalance?: number,
    @Arg("saving", { defaultValue: 0 }) saving?: number,
    @Arg("bills", { defaultValue: 0 }) bills?: number
  ): Promise<ProfileResponse> {
    if (!firstName) {
      return {
        errorFeilds: [
          { field: "firstName", message: "Please enter first name" },
        ],
      };
    }
    if (!lastName) {
      return {
        errorFeilds: [{ field: "lastName", message: "Please enter last name" }],
      };
    }
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
    profile.firstName = firstName;
    profile.lastName = lastName;
    profile.salary = salary;
    profile.timeLeftToNextSalary = new Date(timeLeftToNextSalary);
    profile.saving = saving;
    profile.bills = bills;

    await profile.save();
    req.user.profile = profile;
    req.user.save();

    // Create expense if use enters current balance
    if (currentBalance) {
      const expense = new Expense();
      expense.date = new Date();
      expense.moneySpent = salary - currentBalance;
      expense.purpose = "unknown";
      expense.profile = profile;
      expense.save();
    }
    return { profile };
  }

  // UPDATE PROFILE
  @Mutation(() => ProfileResponse)
  @UseMiddleware(AuthMiddleware)
  async updateProfile(
    @Ctx() { req }: RequestResponseExpress,
    @Arg("firstName", { nullable: true }) firstName: string,
    @Arg("lastName", { nullable: true }) lastName: string,
    @Arg("salary", { nullable: true }) salary: number,
    @Arg("timeLeftToNextSalary", { nullable: true })
    timeLeftToNextSalary: string,
    @Arg("saving", { nullable: true }) saving: number,
    @Arg("bills", { nullable: true }) bills: number
  ): Promise<ProfileResponse> {
    const profile = req.user.profile;
    if (firstName) {
      profile.firstName = firstName;
    }
    if (lastName) {
      profile.lastName = lastName;
    }
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
