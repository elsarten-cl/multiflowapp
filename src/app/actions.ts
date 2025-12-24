'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { CreatePostSchema, ToneEnum, PlatformEnum, PostTypeEnum } from '@/lib/schemas';
import { generateContentDraft } from '@/ai/flows/generate-content-draft';
import { generateContentWithTone } from '@/ai/flows/generate-content-with-tone';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { generateContentInSelectedTone } from '@/ai/flows/generate-content-in-selected-tone';

export type FormState = {
  message: string;
  errors?: Record<string, string[] | undefined> | string;
  data?: any;
  success?: boolean;
};

// Action to generate a draft
export async function generateDraftAction(prevState: any, formData: FormData) {
  const idea = formData.get('idea') as string;
  const rawTone = formData.get('tono');
  const postType = formData.get('postType') as z.infer<typeof PostTypeEnum>;

  const toneResult = ToneEnum.safeParse(rawTone);
  const postTypeResult = PostTypeEnum.safeParse(postType);

  if (!idea || !toneResult.success || !postTypeResult.success) {
    return { success: false, message: "La idea, un tono válido y el tipo de publicación son requeridos para generar un borrador." };
  }

  try {
    const result = await generateContentDraft({ idea, selectedTone: toneResult.data, postType: postTypeResult.data });
    return { success: true, message: "Borrador generado.", data: result };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Error al generar el borrador." };
  }
}

// Action to generate final content and previews
export async function generateContentAndPreviewsAction(prevState: any, formData: FormData) {
    const textInput = formData.get('textoBase') as string;
    const rawTone = formData.get('tono');

    const toneResult = ToneEnum.safeParse(rawTone);

    if (!textInput || !toneResult.success) {
        return { success: false, message: 'El texto base y el tono son requeridos para generar vistas previas.' };
    }

    try {
        const platforms: z.infer<typeof PlatformEnum>[] = ['facebook', 'instagram'];
        
        const [contentResult, ...previews] = await Promise.all([
             generateContentWithTone({ textInput, selectedTone: toneResult.data }),
            ...platforms.map(platform => 
                generateContentInSelectedTone({ textInput, selectedTone: toneResult.data, platform })
            )
        ]);

        const responseData = {
            optimizedContent: contentResult.content,
            previews: {
                facebook: previews[0].content,
                instagram: previews[1].content,
            }
        };

        return { success: true, message: 'Contenido y vistas previas generadas.', data: responseData };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Error al generar el contenido y las vistas previas.' };
    }
}


// Action to publish/save the post
export async function publishAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = CreatePostSchema.safeParse(Object.fromEntries(formData.entries()));
  
  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Por favor, corrige los errores del formulario.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { data } = validatedFields;
  
  try {
    const app = getFirebaseAdminApp();
    const db = getFirestore(app);
    const now = Timestamp.now();
    
    const postData = {
      tituloPublicacion: data.tituloPublicacion,
      textoBase: data.textoBase,
      tono: data.tono,
      imageUrl: data.imageUrl,
      postType: data.postType,
      status: 'borrador',
      createdAt: now,
      updatedAt: now,
      nombreProducto: data.nombreProducto,
      precio: data.precio,
      descripcionProducto: data.descripcionProducto,
    };

    const docRef = await db.collection('posts').add(postData);

    let message = `Borrador "${data.tituloPublicacion}" guardado con éxito.`;

    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...postData, id: docRef.id }),
        });

        if (response.ok) {
          await docRef.update({ status: 'publicado', updatedAt: Timestamp.now() });
          message = `Publicación "${data.tituloPublicacion}" enviada con éxito.`;
        } else {
          await docRef.update({ status: 'error', updatedAt: Timestamp.now() });
          message = `Borrador guardado, pero la publicación falló (Webhook: ${response.status}).`;
        }
      } catch (fetchError) {
        await docRef.update({ status: 'error', updatedAt: Timestamp.now() });
        message = `Borrador guardado, pero la publicación falló (Error de red).`;
        console.error('Webhook fetch error:', fetchError);
      }
    } else {
      console.warn('MAKE_WEBHOOK_URL is not set. Skipping webhook call.');
      // Keep status as 'borrador'
    }
    
    revalidatePath('/dashboard/create-post');
    return { success: true, message };
  } catch (e) {
    console.error('Error in publishAction:', e);
    const errorMessage = e instanceof Error ? e.message : 'Un error desconocido ocurrió.';
    return { 
      success: false, 
      message: `Error al procesar la publicación: ${errorMessage}`,
      errors: typeof e === 'object' && e !== null && 'message' in e ? String(e.message) : undefined
    };
  }
}

    