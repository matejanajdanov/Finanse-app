import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { User } from "../entity/User";
import { Expense } from "../entity/Expense";
import { RequestResponseExpress } from "../types";

@Resolver()
export class ExpenseResolver {
  @Mutation(() => Boolean)
  async createExpense(
    @Arg("purpose") purpose: string,
    @Arg("moneySpent") moneySpent: number,
    @Ctx() { req }: RequestResponseExpress
  ) {
    const user = await User.findOne({ id: req.session.userId });
    if (!user) return { error: "User not authenticated" };
    // if (!profile) return { error: "User not authenticated" };
    const expenseDb = new Expense();
    expenseDb.moneySpent = moneySpent;
    expenseDb.purpose = purpose;
    // expenseDb.profile = profile;
  }
}

// @Field(() => String)
// @Column()
// purpose!: String;

// @Field(() => Float)
// @Column({ type:'decimal' })
// moneySpent!: number;

// @Field(() => Profile)
// @ManyToOne(() => Profile, profile => profile.expense)
// profile: Profile;
