import { Field, Float, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Expense } from './Expense';
import { MonthlyExpense } from './MonthlyExpense';
import { User } from './User';

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
  timeLeftToNextSalary: Date;

  @Field(() => Float)
  @Column({ type: 'decimal', default: 0 })
  saving: number;

  @Field(() => Float)
  @Column({ type: 'decimal', default: 0 })
  bills: number;

  @Field(() => [MonthlyExpense])
  @OneToMany(() => MonthlyExpense, (monthlyExpense) => monthlyExpense.user)
  monthlyExpense: MonthlyExpense[];

  @Field(() => [Expense])
  @OneToMany(() => Expense, (expense) => expense.user)
  expense: Expense[];

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
