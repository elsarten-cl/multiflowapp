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

export const PostTypeEnum = z.enum(['articulo', 'producto']);

export const PlatformEnum = z.enum(['facebook', 'instagram', 'wordpress']);

export const CreatePostSchema = z.object({
  idea: z.string().optional(),
  tono: ToneEnum,
  tituloPublicacion: z.string().min(1, { message: 'El título de la publicación es requerido.'}),
  postType: PostTypeEnum,
  ofertaDeValor: z.string().min(1, { message: 'La oferta de valor es requerida.'}),
  problemaSolucion: z.string().min(1, { message: 'El campo problema/solución es requerido.'}),
  historiaContexto: z.string().optional(),
  conexionTerritorial: z.string().optional(),
  ctaSugerido: z.string().optional(),
  textoBase: z.string().min(1, { message: 'El texto base no puede estar vacío.'}),
  imageUrl: z.string().optional().or(z.literal('')),
  // Campos de producto opcionales
  nombreProducto: z.string().optional(),
  precio: z.string().optional(),
  descripcionProducto: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.postType === 'producto') {
        if (!data.nombreProducto) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['nombreProducto'],
                message: 'El nombre del producto es requerido.',
            });
        }
        if (!data.precio) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['precio'],
                message: 'El precio es requerido.',
            });
        }
    }
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
