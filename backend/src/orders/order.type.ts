import { ObjectType, Field, ID, Float, Int, InputType } from '@nestjs/graphql';
import { OrderStatus, Country } from '../common/enums';

@ObjectType()
export class OrderedMenuItemType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  category: string;

  @Field({ nullable: true })
  imageUrl?: string;
}

@ObjectType()
export class OrderItemType {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number;

  @Field()
  menuItemId: string;

  @Field()
  orderId: string;

  @Field(() => OrderedMenuItemType)
  menuItem: OrderedMenuItemType;
}

@ObjectType()
export class OrderType {
  @Field(() => ID)
  id: string;

  @Field(() => OrderStatus)
  status: string;

  @Field(() => Float)
  total: number;

  @Field(() => Country)
  country: string;

  @Field()
  userId: string;

  @Field()
  restaurantId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [OrderItemType])
  items: OrderItemType[];
}

@InputType()
export class OrderItemInput {
  @Field()
  menuItemId: string;

  @Field(() => Int)
  quantity: number;
}
