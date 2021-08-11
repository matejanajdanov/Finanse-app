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
import { Category } from "../entity/Category";
import { Expense } from "../entity/Expense";

@ObjectType()
export class CategoryResponse {
  @Field({ nullable: true })
  category?: Category;

  @Field({ nullable: true })
  error?: string;
}

@ObjectType()
export class ExpensesByCategory {
  @Field()
  categoryName: string;

  @Field()
  totalExpense: number;
}

@ObjectType()
export class TotalExpensesFromCategories {
  @Field(() => [ExpensesByCategory], { nullable: true })
  expensesByCategory?: ExpensesByCategory[];

  @Field({ nullable: true })
  message?: string;
}

@Resolver()
export class CategoryResolver {
  //CREATE CATEGORY
  @UseMiddleware(AuthMiddleware)
  @Mutation(() => CategoryResponse)
  async createCategory(
    @Ctx() { req }: RequestResponseExpress,
    @Arg("category") category: string
  ): Promise<CategoryResponse> {
    if (!category) {
      return { error: "Please enter category!" };
    }
    const isUnique = await Category.find({
      where: { user: req.user, categoryName: category },
    });

    if (isUnique.length > 0) {
      return { error: "This category already exists!" };
    }

    const newCategory = new Category();
    newCategory.categoryName = category;
    newCategory.user = req.user;

    await newCategory.save();
    return { category: newCategory };
  }
  // GET ALL CATEGORIES FOR SELECTED USER
  @UseMiddleware(AuthMiddleware)
  @Query(() => [Category])
  async getCategories(
    @Ctx() { req }: RequestResponseExpress
  ): Promise<Category[]> {
    return await Category.find({ where: { user: req.user } });
  }
  // DELTE CATEGORY
  @UseMiddleware(AuthMiddleware)
  @Mutation(() => Boolean)
  async deleteCategory(
    @Ctx() { req }: RequestResponseExpress,
    @Arg("id") id: number
  ): Promise<boolean> {
    const category = await Category.findOne({ id }, { relations: ["user"] });
    if (!category) return false;
    if (category.user.id !== req.user.id) throw new Error("Not authenticated!");
    try {
      await category.remove();
      return true;
    } catch (err) {
      return false;
    }
  }
  // GET TOTAL EXPENSES FROM CATEGORY
  @UseMiddleware(AuthMiddleware)
  @Query(() => TotalExpensesFromCategories)
  async getExpensesFromCategory(
    @Ctx() { req }: RequestResponseExpress,
    @Arg("year") year: number,
    @Arg("month") month: number
  ): Promise<TotalExpensesFromCategories> {
    const expenses = await Expense.find({
      where: { profile: req.user.profile },
      relations: ["category"],
    });
    if (!expenses) {
      return { message: "There are no expenses!" };
    }
    const monthlyExpenses = expenses.filter((expense) => {
      return (
        expense.date.getMonth() === month &&
        expense.date.getFullYear() === year &&
        expense.category
      );
    });
    if (monthlyExpenses.length <= 0) {
      return { message: "There are no expenses!" };
    }
    console.log(monthlyExpenses);
    const initialValue: { categoryName: string; totalExpense: number }[] = [];
    const expensesByCategory = monthlyExpenses.reduce((acc, currentValue) => {
      let exists = false;
      acc.forEach((expenseWithTotalValue) => {
        if (
          expenseWithTotalValue.categoryName ===
          currentValue.category.categoryName
        ) {
          exists = true;
          return expenseWithTotalValue.totalExpense + currentValue.moneySpent;
        }
        if (!exists) {
          acc.push({
            categoryName: currentValue.category.categoryName,
            totalExpense: currentValue.moneySpent,
          });
        }
      });
      return [...acc];
    }, initialValue);
    return { expensesByCategory };
  }
}
