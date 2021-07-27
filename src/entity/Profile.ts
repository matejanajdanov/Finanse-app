import { Field, Float, ObjectType } from "type-graphql";
import { Expense } from "./Expense";
import {
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
  Entity,
  Column,
} from "typeorm";

@ObjectType()
@Entity()
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  firstName: string;

  @Field(() => String)
  @Column()
  lastName: string;

  @Field(() => Float)
  @Column({ type: "decimal" })
  salary: number;

  @Field(() => Date)
  @Column({ type: "timestamp" })
  timeLeftToNextSalary: Date;

  @Field(() => Float)
  @Column({ type: "decimal", default: 0 })
  saving: number;

  @Field(() => Float)
  @Column({ type: "decimal", default: 0 })
  bills: number;

  @OneToMany(() => Expense, (expense) => expense.profile)
  expense: Expense[];
}
