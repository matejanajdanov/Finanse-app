import {
  Arg,
  Ctx,
  Field,
  ID,
  Mutation,
  ObjectType,
  Resolver,
} from 'type-graphql';
import { Profile } from '../entity/Profile';
import { User } from '../entity/User';
import { RequestResponseExpress } from '../types';

@ObjectType()
export class ErrorField {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
export class ProfileResponse {
  @Field(() => Profile, { nullable: true })
  profile?: Profile;
  @Field(() => Profile, { nullable: true })
  errorFeilds?: ErrorField[];
}

@Resolver()
export class ProfileResolver {
  @Mutation(() => ProfileResponse)
  async createProfile(
    @Ctx() { req, res }: RequestResponseExpress,
    @Arg('salary') salary: number,
    @Arg('timeLeftToNextSalary') timeLeftToNextSalary: string,
    @Arg('saving', { defaultValue: 0 }) saving?: number,
    @Arg('bills', { defaultValue: 0 }) bills?: number
  ): Promise<ProfileResponse> {
    if (!salary) {
      return {
        errorFeilds: [{ field: 'salary', message: 'Please enter salary!' }],
      };
    } else if (!timeLeftToNextSalary) {
      return {
        errorFeilds: [
          {
            field: 'timeLeftToNextSalary',
            message: 'Please provide date so I can do the math!!!',
          },
        ],
      };
    } else if (!timeLeftToNextSalary && !salary) {
      return {
        errorFeilds: [
          { field: 'salary', message: 'Please enter salary!' },
          {
            field: 'timeLeftToNextSalary',
            message: 'Please provide date so I can do the math!!!',
          },
        ],
      };
    }
    const user = await User.findOne({ id: req.session.userId });
    if (!user) {
      return { errorFeilds: [{ field: 'id', message: 'Not authenticated' }] };
    }
    const profile = new Profile();
    profile.user = user;
    profile.salary = salary;
    profile.timeLeftToNextSalary = new Date(timeLeftToNextSalary);
    profile.saving = saving;
    profile.bills = bills;

    await profile.save();
    return { profile };
  }
}
