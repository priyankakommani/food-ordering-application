import { ObjectType, Field, ID, Float, InputType } from '@nestjs/graphql';

@ObjectType()
export class PaymentMethodType {
  @Field(() => ID)
  id: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  last4?: string;

  @Field({ nullable: true })
  upiId?: string;

  @Field()
  isDefault: boolean;

  @Field()
  userId: string;
}

@ObjectType()
export class PaymentType {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  amount: number;

  @Field()
  status: string;

  @Field()
  orderId: string;

  @Field()
  paymentMethodId: string;

  @Field()
  createdAt: Date;
}

@InputType()
export class CreatePaymentMethodInput {
  @Field()
  type: string;

  @Field({ nullable: true })
  last4?: string;

  @Field({ nullable: true })
  upiId?: string;

  @Field({ defaultValue: false })
  isDefault: boolean;
}
