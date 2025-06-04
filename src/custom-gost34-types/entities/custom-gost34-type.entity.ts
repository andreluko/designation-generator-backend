import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('custom_gost34_types')
@Index(['code'], { unique: true })
export class CustomGost34TypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 2 })
  code: string; // e.g., "И1", "СА"

  @Column()
  name: string; // User-defined name

  @CreateDateColumn() // Using CreateDateColumn for creationDate
  creationDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
