import { Field, ID, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  JoinColumn,
  OneToOne,
  OneToMany,
} from "typeorm";
import { Category } from "./Category";
import { Profile } from "./Profile";

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

  @Field(() => Profile, { nullable: true })
  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @Field(() => [Category], { nullable: true })
  @OneToMany(() => Category, (category) => category.user, { nullable: true })
  category: Category[];
}
