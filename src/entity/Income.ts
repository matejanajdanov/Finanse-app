import { Field, Float, ID, ObjectType } from "type-graphql";
import {
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  Column,
  Entity,
} from "typeorm";
import { Profile } from "./Profile";

@ObjectType()
@Entity()
export class Income extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  purpose?: String;

  @Field(() => Float)
  @Column({ type: "decimal" })
  ammountOfMoney!: number;

  @Field(() => Date)
  @Column({ type: "timestamp", default: new Date() })
  date!: Date;

  @ManyToOne(() => Profile, (profile) => profile.expense)
  profile: Profile;
}
