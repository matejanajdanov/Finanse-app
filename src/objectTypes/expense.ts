import { Field, ObjectType } from "type-graphql";

import { Expense } from "../entity/Expense";

@ObjectType()
export class ExpenseOrMessage {
  @Field(() => String, { nullable: true })
  message?: string;
  @Field(() => Expense, { nullable: true })
  expense?: Expense;
}
