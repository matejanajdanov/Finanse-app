import { Field, Float, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class MonthlyExpense extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => Float)
    @Column({ type:'decimal' })
    totalExpense: number;

    @Field(() => User)
    @ManyToOne(() => User, user => user.monthlyExpense)
    user: User; 
}