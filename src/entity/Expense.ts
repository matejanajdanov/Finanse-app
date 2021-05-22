import { Field, Float, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Expense extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @Column()
    purpose!: String;

    @Field(() => Float)
    @Column({ type:'decimal' })
    moneySpent!: number;

    @Field(() => User)
    @ManyToOne(() => User, user => user.expense)
    user: User;
}