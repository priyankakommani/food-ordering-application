import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Country } from '../common/enums';

@ObjectType()
export class MenuItemType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;

  @Field()
  category: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  restaurantId: string;
}

@ObjectType()
export class RestaurantType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  cuisine: string;

  @Field(() => Country)
  country: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => [MenuItemType])
  menuItems: MenuItemType[];
}
