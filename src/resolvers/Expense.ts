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
import { ExpenseOrMessage } from "../objectTypes/expense";
import { RequestResponseExpress } from "../types";
import { checkIfEmpty } from "../utils/validator";
import { Category } from "../entity/Category";
import { Expense } from "../entity/Expense";

@ObjectType()
export class ExpensesByMonth {
  @Field()
  date: number;

  @Field(() => [Expense])
  expenses: Expense[];
}

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
      relations: ["profile", "category"],
      where: { profile: req.user.profile },
    });
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => ExpenseResponse)
  async getOneExpense(
    @Ctx() { req }: RequestResponseExpress,
    @Arg("id") id: number
  ): Promise<ExpenseResponse> {
    const expense = await Expense.findOne(
      { id },
      { relations: ["profile", "category"] }
    );
    if (!expense)
      return { errorFields: [{ message: "Expense doesn't exist aneymore!" }] };
    if (expense.profile.id !== req.user.profile.id)
      throw new Error("Not authenticated!");
    return { expense };
  }

  @UseMiddleware(AuthMiddleware)
  @Mutation(() => ExpenseResponse)
  async createExpense(
    @Ctx() { req }: RequestResponseExpress,
    @Arg("moneySpent") moneySpent: string,
    @Arg("date") date: string,
    @Arg("purpose", { defaultValue: "Unknown" }) purpose?: string,
    @Arg("categoryId", { nullable: true }) categoryId?: number
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

    if (categoryId) {
      const newCategory = await Category.findOne(categoryId);
      if (!newCategory) {
        return { errorFields: [{ message: "Category doesn't exist!" }] };
      }
      newExpense.category = newCategory;
    }
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
    @Arg("date", { nullable: true }) date?: string,
    @Arg("categoryId", { nullable: true }) categoryId?: number
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
    if (categoryId) {
      console.log(categoryId);
      const category = await Category.findOne(categoryId, {
        relations: ["user"],
      });
      console.log(category, "CATEGORY");
      console.log(category.user, "CATEGORY USER");
      console.log(req.user, "REQ UESR");
      if (!category || category.user !== req.user) {
        return { message: "Please choose correct category!" };
      }
      expense.category = category;
    }
    try {
      await expense.save();
      return { expense };
    } catch (err) {
      return { message: "Server error" };
    }
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => [Expense])
  async getExpenseByDate(
    @Arg("date") date: string,
    @Ctx() { req }: RequestResponseExpress
  ) {
    const expenses = await Expense.find({
      relations: ["profile", "category"],
      where: { profile: req.user.profile },
    });
    return expenses.filter(
      (expense) => expense.date.toISOString().split("T")[0] === date
    );
  }

  @UseMiddleware(AuthMiddleware)
  @Query(() => [ExpensesByMonth])
  async getExpenseByMonth(
    @Arg("year") year: number,
    @Arg("month") month: number,
    @Ctx() { req }: RequestResponseExpress
  ): Promise<ExpensesByMonth[]> {
    const expenses = await Expense.find({
      where: { profile: req.user.profile },
      order: { date: "DESC" },
      relations: ["category", "profile"],
    });
    const monthlyExpenses = expenses.filter(
      (expense) =>
        expense.date.getMonth() === month && expense.date.getFullYear() === year
    );
    const dates: number[] = [];
    const byDates: { date: number; expenses: [Expense] }[] = [];

    monthlyExpenses.map((expense) => {
      if (!dates.includes(expense.date.getDate())) {
        dates.unshift(expense.date.getDate());
        return byDates.push({
          date: expense.date.getDate(),
          expenses: [expense],
        });
      }
      byDates.forEach((expenseDate) => {
        if (expense.date.getDate() === expenseDate.date) {
          expenseDate.expenses.push(expense);
        }
      });
    });

    return byDates;
  }
}
