import { Field, ID, ObjectType } from "type-graphql";
import {
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  OneToMany,
  Column,
  Entity,
} from "typeorm";

import { Expense } from "./Expense";
import { User } from "./User";

@ObjectType()
@Entity()
export class Category extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({ type: "varchar" })
  categoryName: string;

  @ManyToOne(() => User, (user) => user.category)
  user: User;

  @OneToMany(() => Expense, (expense) => expense.category)
  expense: Expense;
}
