'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { CreatePostSchema, ToneEnum } from '@/lib/schemas';
import { generateContentDraft } from '@/ai/flows/generate-content-draft';
import { generateContentWithTone } from '@/ai/flows/generate-content-with-tone';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { generateContentInSelectedTone, PlatformEnum } from '@/ai/flows/generate-content-in-selected-tone';

export type FormState = {
  message: string;
  errors?: Record<string, string[] | undefined> | string;
  data?: any;
  success?: boolean;
  pending?: boolean;
};

// Action to generate a draft
export async function generateDraftAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const idea = formData.get('idea') as string;
  const rawTone = formData.get('tono');

  const toneResult = ToneEnum.safeParse(rawTone);

  if (!idea || !toneResult.success) {
    return { success: false, message: "La idea y un tono válido son requeridos para generar un borrador." };
  }

  try {
    const result = await generateContentDraft({ idea, selectedTone: toneResult.data });
    return { success: true, message: "Borrador generado.", data: result };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Error al generar el borrador." };
  }
}

// Action to generate final content
export async function generateContentAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const textInput = formData.get('textoBase') as string;
  const rawTone = formData.get('tono');

  const toneResult = ToneEnum.safeParse(rawTone);

  if (!textInput || !toneResult.success) {
    return { success: false, message: "El texto base y un tono válido son requeridos." };
  }

  try {
    const result = await generateContentWithTone({ textInput, selectedTone: toneResult.data });
    return { success: true, message: "Contenido generado.", data: result };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Error al generar contenido." };
  }
}

export async function generatePreviewAction(prevState: FormState, formData: FormData): Promise<FormState> {
    const textInput = formData.get('textoBase') as string;
    const rawTone = formData.get('tono');

    const toneResult = ToneEnum.safeParse(rawTone);

    if (!textInput || !toneResult.success) {
        return { success: false, message: 'El texto base y el tono son requeridos para generar vistas previas.' };
    }

    try {
        const platforms: z.infer<typeof PlatformEnum>[] = ['facebook', 'instagram', 'wordpress'];
        const previews = await Promise.all(
            platforms.map(platform => 
                generateContentInSelectedTone({ textInput, selectedTone: toneResult.data, platform })
            )
        );

        const previewData = {
            facebook: previews[0].content,
            instagram: previews[1].content,
            wordpress: previews[2].content,
        };

        return { success: true, message: 'Vistas previas generadas.', data: previewData };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Error al generar las vistas previas.' };
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
  const now = Timestamp.now();
  
  const postData = {
    tituloInterno: data.tituloInterno,
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

  try {
    getFirebaseAdminApp();
    const db = getFirestore();
    const docRef = await db.collection('posts').add(postData);

    let message = `Borrador "${data.tituloInterno}" guardado con éxito.`;

    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('MAKE_WEBHOOK_URL is not set.');
      await docRef.update({ status: 'error', updatedAt: Timestamp.now() });
      return { success: false, message: 'Borrador guardado, pero la publicación falló: El webhook no está configurado.' };
    }
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...postData, id: docRef.id }),
    });

    if (response.ok) {
      await docRef.update({ status: 'publicado', updatedAt: Timestamp.now() });
      message = `Publicación "${data.tituloInterno}" enviada con éxito.`;
    } else {
      await docRef.update({ status: 'error', updatedAt: Timestamp.now() });
      throw new Error(`Webhook falló con estado: ${response.status}`);
    }
    
    revalidatePath('/dashboard/create-post');
    return { success: true, message };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'Un error desconocido ocurrió.';
    return { success: false, message: `Error al procesar la publicación: ${errorMessage}` };
  }
}
