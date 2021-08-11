import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class MainExpensesCategories {
  @Field()
  category: string;

  @Field()
  totalAmount: number;
}

@ObjectType()
export class ProfileMainExpenses {
  @Field(() => MainExpensesCategories)
  categories: { category: string; totalAmount: number }[] = [];

  @Field(() => Number)
  todayLeft: number;

  @Field(() => Number)
  monthlyLeft: number;

  @Field(() => Number)
  spentThisMonth: number;
}
