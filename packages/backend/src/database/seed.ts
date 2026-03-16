/**
 * Database Seeder - Run to create initial admin user and sample data
 * Usage: npx ts-node src/database/seed.ts
 */
import { createConnection } from 'typeorm';
import * as bcrypt from 'bcryptjs';

async function seed() {
  const connection = await createConnection({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'liana_hr',
    synchronize: true,
    entities: ['src/**/*.entity.ts'],
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  await connection.query(`
    INSERT IGNORE INTO users (email, password, role, isActive) 
    VALUES ('admin@liana-hr.com', '${hashedPassword}', 'system_admin', 1)
  `);

  // Create departments
  await connection.query(`
    INSERT IGNORE INTO departments (name, code) VALUES 
    ('Human Resources', 'HR'),
    ('Information Technology', 'IT'),
    ('Finance', 'FIN'),
    ('Operations', 'OPS'),
    ('Management', 'MGT')
  `);

  console.log('✅ Database seeded successfully!');
  console.log('Admin email: admin@liana-hr.com');
  console.log('Admin password: Admin123!');
  
  await connection.close();
}

seed().catch(console.error);
