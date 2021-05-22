import { Field, Float, ID, ObjectType } from 'type-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { Expense } from './Expense';
import { MonthlyExpense } from './MonthlyExpense';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

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
  bills: number

  @Field(() => [MonthlyExpense])
  @OneToMany(() => MonthlyExpense, monthlyExpense => monthlyExpense.user)
  monthlyExpense: MonthlyExpense[]

  @Field(() => [Expense])
  @OneToMany(() => Expense, expense => expense.user)
  expense: Expense[]
}
