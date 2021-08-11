import {
  UseMiddleware,
  ObjectType,
  Mutation,
  Resolver,
  Field,
  Query,
  Arg,
  Ctx,
} from "type-graphql";

import { AuthMiddleware } from "../middlewares/authMiddleware";
import { RequestResponseExpress } from "../types";
import { checkIfEmpty } from "../utils/validator";
import { Income } from "../entity/Income";

@ObjectType()
export class IncomeResponse {
  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => Income, { nullable: true })
  income?: Income;
}

@Resolver()
export class IncomeResolver {
  @UseMiddleware(AuthMiddleware)
  @Query(() => [Income])
  async getIncomes(@Ctx() { req }: RequestResponseExpress) {
    return await Income.find({ where: { profile: req.user.profile } });
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => IncomeResponse)
  async createIncome(
    @Ctx() { req }: RequestResponseExpress,
    @Arg("ammountOfMoney") ammountOfMoney: number,
    @Arg("purpose") purpose: string,
    @Arg("date", { defaultValue: new Date() }) date?: Date
  ): Promise<IncomeResponse> {
    if (!checkIfEmpty([purpose])) {
      return { message: "Please fill all fields" };
    }
    let income = new Income();
    income.ammountOfMoney = ammountOfMoney;
    income.date = date;
    income.profile = req.user.profile;
    await income.save();
    return { income };
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => Boolean)
  async deleteIncome(
    @Ctx() { req }: RequestResponseExpress,
    @Arg("id") id: number
  ): Promise<boolean> {
    const income = await Income.findOne({ id }, { relations: ["profile"] });
    if (!income) return false;
    if (income.profile.id !== req.user.profile.id)
      throw new Error("Not authenticated!");
    try {
      await income.remove();
      return true;
    } catch (err) {
      return false;
    }
  }
  @UseMiddleware(AuthMiddleware)
  @Query(() => [Income])
  async getIncomesByMonth(
    @Ctx() { req }: RequestResponseExpress,
    @Arg("year") year: number,
    @Arg("month") month: number
  ): Promise<Income[]> {
    const incomes = await Income.find({
      where: { profile: req.user.profile },
      order: { date: "DESC" },
    });
    return incomes.filter((income) => {
      return (
        income.date.getFullYear() === year && income.date.getMonth() === month
      );
    });
  }
}
