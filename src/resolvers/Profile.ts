import { Mutation, Resolver } from "type-graphql";
import { Profile } from "../entity/Profile";

@Resolver()
export class ProfileResolver {
    @Mutation(() => Profile)
    async createProfile() {

    }
}