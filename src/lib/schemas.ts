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
  ofertaDeValor: z.string().min(1, 'La oferta de valor es requerida.'),
  problemaSolucion: z.string().min(1, 'El campo problema/solución es requerido.'),
  historiaContexto: z.string().optional(),
  conexionTerritorial: z.string().optional(),
  ctaSugerido: z.string().optional(),
  textoBase: z.string().min(1, 'El texto base no puede estar vacío.'),
  imageUrl: z.string().optional().or(z.literal('')),
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;

    

    