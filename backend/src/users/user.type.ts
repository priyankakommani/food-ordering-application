import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Role, Country } from '../common/enums';

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => Role)
  role: string;

  @Field(() => Country)
  country: string;

  @Field()
  createdAt: Date;
}
