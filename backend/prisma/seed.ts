import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ROLE = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  MEMBER: 'MEMBER',
} as const;

const COUNTRY = {
  INDIA: 'INDIA',
  AMERICA: 'AMERICA',
} as const;

async function main() {
  // Seed Users
  const password = await bcrypt.hash('password123', 10);

  const nickFury = await prisma.user.upsert({
    where: { email: 'nick@shield.com' },
    update: {},
    create: { name: 'Nick Fury', email: 'nick@shield.com', password, role: ROLE.ADMIN, country: COUNTRY.AMERICA },
  });

  const captainMarvel = await prisma.user.upsert({
    where: { email: 'marvel@shield.com' },
    update: {},
    create: { name: 'Captain Marvel', email: 'marvel@shield.com', password, role: ROLE.MANAGER, country: COUNTRY.INDIA },
  });

  const captainAmerica = await prisma.user.upsert({
    where: { email: 'america@shield.com' },
    update: {},
    create: { name: 'Captain America', email: 'america@shield.com', password, role: ROLE.MANAGER, country: COUNTRY.AMERICA },
  });

  const thanos = await prisma.user.upsert({
    where: { email: 'thanos@shield.com' },
    update: {},
    create: { name: 'Thanos', email: 'thanos@shield.com', password, role: ROLE.MEMBER, country: COUNTRY.INDIA },
  });

  const thor = await prisma.user.upsert({
    where: { email: 'thor@shield.com' },
    update: {},
    create: { name: 'Thor', email: 'thor@shield.com', password, role: ROLE.MEMBER, country: COUNTRY.INDIA },
  });

  const travis = await prisma.user.upsert({
    where: { email: 'travis@shield.com' },
    update: {},
    create: { name: 'Travis', email: 'travis@shield.com', password, role: ROLE.MEMBER, country: COUNTRY.AMERICA },
  });

  // Seed Indian Restaurants
  const spicyKitchen = await prisma.restaurant.upsert({
    where: { id: 'rest-india-1' },
    update: {},
    create: {
      id: 'rest-india-1',
      name: 'Spicy Kitchen',
      cuisine: 'North Indian',
      country: COUNTRY.INDIA,
      imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
      menuItems: {
        create: [
          { name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry', price: 12.99, category: 'Main Course' },
          { name: 'Dal Makhani', description: 'Slow-cooked black lentils', price: 8.99, category: 'Main Course' },
          { name: 'Garlic Naan', description: 'Freshly baked flatbread with garlic', price: 2.99, category: 'Bread' },
          { name: 'Mango Lassi', description: 'Refreshing yogurt mango drink', price: 3.99, category: 'Beverages' },
          { name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 10.99, category: 'Starters' },
        ],
      },
    },
  });

  const biryaniHouse = await prisma.restaurant.upsert({
    where: { id: 'rest-india-2' },
    update: {},
    create: {
      id: 'rest-india-2',
      name: 'Biryani House',
      cuisine: 'South Indian',
      country: COUNTRY.INDIA,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
      menuItems: {
        create: [
          { name: 'Chicken Biryani', description: 'Fragrant basmati rice with chicken', price: 13.99, category: 'Main Course' },
          { name: 'Mutton Biryani', description: 'Slow-cooked mutton with saffron rice', price: 15.99, category: 'Main Course' },
          { name: 'Raita', description: 'Cooling yogurt side dish', price: 2.49, category: 'Sides' },
          { name: 'Dosa', description: 'Crispy rice and lentil crepe', price: 7.99, category: 'Main Course' },
          { name: 'Filter Coffee', description: 'Traditional South Indian coffee', price: 2.99, category: 'Beverages' },
        ],
      },
    },
  });

  // Seed American Restaurants
  const burgerJoint = await prisma.restaurant.upsert({
    where: { id: 'rest-america-1' },
    update: {},
    create: {
      id: 'rest-america-1',
      name: 'The Burger Joint',
      cuisine: 'American',
      country: COUNTRY.AMERICA,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      menuItems: {
        create: [
          { name: 'Classic Cheeseburger', description: 'Juicy beef patty with cheddar', price: 9.99, category: 'Burgers' },
          { name: 'BBQ Bacon Burger', description: 'Smoky BBQ sauce with crispy bacon', price: 12.99, category: 'Burgers' },
          { name: 'Crispy Fries', description: 'Golden crispy french fries', price: 3.99, category: 'Sides' },
          { name: 'Chocolate Milkshake', description: 'Thick and creamy chocolate shake', price: 5.99, category: 'Beverages' },
          { name: 'Onion Rings', description: 'Beer-battered onion rings', price: 4.99, category: 'Sides' },
        ],
      },
    },
  });

  const pizzaPalace = await prisma.restaurant.upsert({
    where: { id: 'rest-america-2' },
    update: {},
    create: {
      id: 'rest-america-2',
      name: 'Pizza Palace',
      cuisine: 'Italian-American',
      country: COUNTRY.AMERICA,
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
      menuItems: {
        create: [
          { name: 'Margherita Pizza', description: 'Classic tomato and mozzarella', price: 11.99, category: 'Pizza' },
          { name: 'Pepperoni Pizza', description: 'Loaded with premium pepperoni', price: 13.99, category: 'Pizza' },
          { name: 'Caesar Salad', description: 'Fresh romaine with caesar dressing', price: 7.99, category: 'Salads' },
          { name: 'Garlic Bread', description: 'Toasted bread with herb butter', price: 4.99, category: 'Sides' },
          { name: 'Tiramisu', description: 'Classic Italian dessert', price: 6.99, category: 'Desserts' },
        ],
      },
    },
  });

  // Add payment methods
  await prisma.paymentMethod.upsert({
    where: { id: 'pm-nick-1' },
    update: {},
    create: {
      id: 'pm-nick-1',
      type: 'credit_card',
      last4: '4242',
      isDefault: true,
      userId: nickFury.id,
    },
  });

  await prisma.paymentMethod.upsert({
    where: { id: 'pm-marvel-1' },
    update: {},
    create: {
      id: 'pm-marvel-1',
      type: 'upi',
      upiId: 'marvel@upi',
      isDefault: true,
      userId: captainMarvel.id,
    },
  });

  await prisma.paymentMethod.upsert({
    where: { id: 'pm-america-1' },
    update: {},
    create: {
      id: 'pm-america-1',
      type: 'credit_card',
      last4: '1234',
      isDefault: true,
      userId: captainAmerica.id,
    },
  });

  console.log('✅ Seeded: Nick Fury, Captain Marvel, Captain America, Thanos, Thor, Travis');
  console.log('✅ Seeded: 4 Restaurants with menu items');
  console.log('✅ Seeded: Payment methods');
  console.log('\n🔐 Login Credentials (all passwords: password123):');
  console.log('  nick@shield.com     → ADMIN (Global)');
  console.log('  marvel@shield.com   → MANAGER (India)');
  console.log('  america@shield.com  → MANAGER (America)');
  console.log('  thanos@shield.com   → MEMBER (India)');
  console.log('  thor@shield.com     → MEMBER (India)');
  console.log('  travis@shield.com   → MEMBER (America)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
