import type { Timestamp } from 'firebase/firestore';
import type { CreatePostInput } from './schemas';

export type Post = Omit<CreatePostInput, 'tituloPublicacion'> & {
  id?: string;
  tituloPublicacion?: string; // Mantener para compatibilidad hacia atrás si es necesario
  tituloInterno?: string; // Para datos antiguos
  status: 'borrador' | 'publicado' | 'programado' | 'error';
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  // In the future, this would be linked to a user
  // userId: string; 
};
