import { Field, Float, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Expense } from "./Expense";
import { MonthlyExpense } from "./MonthlyExpense";

@ObjectType()
@Entity()
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Float)
  @Column({ type: 'decimal' })
  salary: number;

  @Field(() => String)
  @Column({ type: 'timestamp' })
  timeLeftToNextSalary: string;

  @Field(() => Float)
  @Column({ type: 'decimal', default: 0 })
  saving: number;

  @Field(() => Float)
  @Column({ type: 'decimal', default: 0 })
  bills: number;

  @Field(() => [MonthlyExpense])
  @OneToMany(() => MonthlyExpense, monthlyExpense => monthlyExpense.user)
  monthlyExpense: MonthlyExpense[]

  @Field(() => [Expense])
  @OneToMany(() => Expense, expense => expense.user)
  expense: Expense[]
}