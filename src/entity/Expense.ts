import { Field, Float, ID, ObjectType } from "type-graphql";
import {
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  Column,
  Entity,
} from "typeorm";
import { Category } from "./Category";

import { Profile } from "./Profile";

@ObjectType()
@Entity()
export class Expense extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  purpose?: String;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, { nullable: true })
  category?: Category;

  @Field(() => Float)
  @Column({ type: "decimal" })
  moneySpent!: number;

  @Field(() => Date)
  @Column({ type: "timestamp" })
  date!: Date;

  @Field(() => Profile)
  @ManyToOne(() => Profile, (profile) => profile.expense)
  profile: Profile;
}
