import type { Timestamp } from 'firebase/firestore';
import type { CreatePostInput } from './schemas';

export type Post = CreatePostInput & {
  id?: string;
  status: 'borrador' | 'publicado' | 'programado' | 'error';
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  // In the future, this would be linked to a user
  // userId: string; 
};
