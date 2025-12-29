import { prisma } from '@/utils/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const root = await prisma.user.findFirst({ where: { role: 'ROOT' } });
  if (!root) {
    const password = process.env.ROOT_PASSWORD;
    if (!password) {
      throw new Error('ROOT_PASSWORD env variable is not set!');
    }
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email: 'medhelpedu@gmail.com',
        password: hash,
        name: 'Ватажко Михайло',
        role: 'ROOT'
      }
    });
    console.log('Root user created!');
  } else {
    console.log('Root user already exists.');
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());