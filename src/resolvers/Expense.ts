import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";

import { AuthMiddleware } from "../middlewares/authMiddleware";
import { RequestResponseExpress } from "../types";
import { checkIfEmpty } from "../utils/validator";
import { Expense } from "../entity/Expense";
import { ExpenseOrMessage } from "../objectTypes/expense";

@ObjectType()
export class ExpenseError {
  @Field()
  message?: string;
  @Field({ nullable: true })
  serrverError?: boolean;
}

@ObjectType()
export class ExpenseResponse {
  @Field(() => Expense, { nullable: true })
  expense?: Expense;

  @Field(() => [ExpenseError], { nullable: true })
  errorFields?: ExpenseError[];
}

@ObjectType()
class ExpenseDeleteResponse {
  @Field(() => Boolean)
  isDeleted: boolean;

  @Field(() => String, { nullable: true })
  message?: string;
}

@Resolver()
export class ExpenseResolver {
  @UseMiddleware(AuthMiddleware)
  @Query(() => [Expense])
  async getAllExpenses(
    @Ctx() { req }: RequestResponseExpress
  ): Promise<Expense[]> {
    return await Expense.find({
      relations: ["profile"],
      where: { profile: req.user.profile },
    });
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => ExpenseResponse)
  async getOneExpense(
    @Ctx() { req }: RequestResponseExpress,
    @Arg("id") id: number
  ): Promise<ExpenseResponse> {
    const expense = await Expense.findOne({ id }, { relations: ["profile"] });
    if (!expense)
      return { errorFields: [{ message: "Expense doesn't exist aneymore!" }] };
    if (expense.profile.id !== req.user.profile.id)
      throw new Error("Not authenticated!");
    return { expense };
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => ExpenseResponse)
  async createExpense(
    @Arg("purpose") purpose: string,
    @Arg("moneySpent") moneySpent: string,
    @Arg("date") date: string,
    @Ctx() { req }: RequestResponseExpress
  ): Promise<ExpenseResponse> {
    // Check if all fields are not empty
    const isValid = checkIfEmpty([purpose, moneySpent, date]);
    if (!isValid)
      return {
        errorFields: [{ message: "Please fill all fields" }],
      };

    const profile = req.user.profile;
    if (!profile)
      return { errorFields: [{ message: "Please create profile first" }] };
    const newExpense = new Expense();

    newExpense.date = new Date(date);
    newExpense.moneySpent = parseFloat(moneySpent);
    newExpense.purpose = purpose;
    newExpense.profile = profile;
    try {
      await newExpense.save();
      return { expense: newExpense };
    } catch (err) {
      if (err)
        return {
          errorFields: [{ serrverError: true }],
        };
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => ExpenseDeleteResponse)
  async deleteExpense(
    @Ctx() { req }: RequestResponseExpress,
    @Arg("id") id: number
  ): Promise<ExpenseDeleteResponse> {
    const expense = await Expense.findOne({ id }, { relations: ["profile"] });
    if (!expense) return { isDeleted: false, message: "Expense doesn't exist" };
    if (expense.profile.id !== req.user.profile.id)
      throw new Error("Not authenticated!");
    try {
      await expense.remove();
      return { isDeleted: true };
    } catch (err) {
      return { isDeleted: false, message: "server error" };
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => ExpenseOrMessage)
  async updateExpense(
    @Ctx() { req }: RequestResponseExpress,
    @Arg("id") id: number,
    @Arg("purpose", { nullable: true }) purpose?: string,
    @Arg("moneySpent", { nullable: true }) moneySpent?: string,
    @Arg("date", { nullable: true }) date?: string
  ): Promise<ExpenseOrMessage> {
    const expense = await Expense.findOne({ id }, { relations: ["profile"] });
    if (!expense) return { message: "Expense doesn't exist!" };
    if (purpose) {
      expense.purpose = purpose;
    }
    if (moneySpent) {
      expense.moneySpent = parseFloat(moneySpent);
    }
    if (date) {
      expense.date = new Date(date);
    }
    try {
      await expense.save();
      return { expense };
    } catch (err) {
      return { message: "Server error" };
    }
  }

  // @UseMiddleware(AuthMiddleware)
  // @Query(() => ExpenseResponse)
  // getMonthlyExpenses(
  //   @Arg("month"):
  // )
}
