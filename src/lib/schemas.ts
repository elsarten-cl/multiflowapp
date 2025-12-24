import { z } from 'zod';

export const TONES = [
  'Persuasivo',
  'Estrategico',
  'Influencer',
  'Inspirador',
  'Periodista',
  'Corporativo',
  'Humoristico',
] as const;

export const ToneEnum = z.enum(TONES);

export const CreatePostSchema = z.object({
  idea: z.string().optional(),
  tono: ToneEnum,
  tituloInterno: z.string().min(1, 'El título interno es requerido.'),
  titular: z.string().min(1, 'El titular es requerido.'),
  cuerpo: z.string().min(1, 'El cuerpo es requerido.'),
  cta: z.string().optional(),
  textoBase: z.string().min(1, 'El texto base no puede estar vacío.'),
  imageUrl: z.string().optional().or(z.literal('')),
  // Deprecated fields from previous version
  publishMode: z.enum(['ahora', 'programado']).optional().default('ahora'),
  publishAt: z.coerce.date().optional(),
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;

    