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
  tituloInterno: z.string().min(1, 'El título interno es requerido.'),
  textoBase: z.string().min(1, 'El texto base es requerido.'),
  tono: ToneEnum,
  imageUrl: z.string().url('Debe ser una URL válida.').optional().or(z.literal('')),
  publishMode: z.enum(['ahora', 'programado']),
  publishAt: z.coerce.date().optional(),
}).refine(data => {
    if (data.publishMode === 'programado') {
        return !!data.publishAt;
    }
    return true;
}, {
    message: 'La fecha de publicación es requerida para programar.',
    path: ['publishAt'],
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
