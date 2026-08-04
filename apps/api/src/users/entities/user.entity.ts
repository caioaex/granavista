import { BaseEntity } from "../../common/entities/base.entity";
import { Column, Entity, Index } from "typeorm";


@Entity('users')
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, select: false })
  passwordHash!: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  name!: string | null;
}
