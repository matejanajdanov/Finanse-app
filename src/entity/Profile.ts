import { Field, Float, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Expense } from './Expense';
import { MonthlyExpense } from './MonthlyExpense';

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

  @OneToMany(() => MonthlyExpense, monthlyExpense => monthlyExpense.profile)
  monthlyExpense: MonthlyExpense[];

  @OneToMany(() => Expense, expense => expense.profile)
  expense: Expense[];
}
