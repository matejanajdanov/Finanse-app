import { Field, Float, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Profile } from "./Profile";

@ObjectType()
@Entity()
export class MonthlyExpense extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => Float)
    @Column({ type:'decimal' })
    totalExpense: number;

    @Field(() => Date)
    @Column(({type: 'timestamp'}))
    month: Date;

    @Field(() => Profile)
    @ManyToOne(() => Profile, profile => profile.monthlyExpense)
    profile: Profile; 
}