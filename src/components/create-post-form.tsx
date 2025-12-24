'use client';

import { useEffect, useTransition, useActionState, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles, Send, Upload } from 'lucide-react';
import Image from 'next/image';

import { CreatePostSchema, TONES, type CreatePostInput } from '@/lib/schemas';
import { generateDraftAction, generateContentAction, publishAction } from '@/app/actions';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const initialFormState = { message: '', errors: {}, success: false };

export function CreatePostForm() {
  const { toast } = useToast();
  const [isDraftPending, startDraftTransition] = useTransition();
  const [isContentPending, startContentTransition] = useTransition();

  const form = useForm<CreatePostInput>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: {
      idea: '',
      tono: 'Persuasivo',
      tituloInterno: '',
      titular: '',
      cuerpo: '',
      cta: '',
      textoBase: '',
      imageUrl: '',
    },
  });

  const { control, setValue } = form;

  const titular = useWatch({ control, name: 'titular' });
  const cuerpo = useWatch({ control, name: 'cuerpo' });
  const cta = useWatch({ control, name: 'cta' });
  const imageUrl = useWatch({ control, name: 'imageUrl' });

  useEffect(() => {
    const unifiedText = `${titular || ''}\n\n${cuerpo || ''}\n\n${cta || ''}`.trim();
    setValue('textoBase', unifiedText, { shouldValidate: true, shouldDirty: true });
  }, [titular, cuerpo, cta, setValue]);

  const [publishState, publishFormAction] = useActionState(publishAction, initialFormState);

  useEffect(() => {
    if (publishState.message) {
      toast({
        title: publishState.success ? 'Éxito' : 'Error',
        description: publishState.message,
        variant: publishState.success ? 'default' : 'destructive',
      });
    }
    if (publishState.success) {
      form.reset();
    }
  }, [publishState, toast, form]);

  const handleGenerateDraft = () => {
    startDraftTransition(async () => {
      const formData = new FormData();
      formData.append('idea', form.getValues('idea') || '');
      formData.append('tono', form.getValues('tono'));
      const result = await generateDraftAction(initialFormState, formData);
      if (result.success && result.data?.draft) {
        // Simple parsing logic, assuming draft is "Titular: ...\nCuerpo: ...\nCTA: ..."
        const draft = result.data.draft;
        const titularMatch = draft.match(/Titular:(.*)/);
        const cuerpoMatch = draft.match(/Cuerpo:(.*)/);
        const ctaMatch = draft.match(/CTA:(.*)/);

        if (titularMatch) setValue('titular', titularMatch[1].trim(), { shouldValidate: true });
        if (cuerpoMatch) setValue('cuerpo', cuerpoMatch[1].trim(), { shouldValidate: true });
        if (ctaMatch) setValue('cta', ctaMatch[1].trim(), { shouldValidate: true });
        
        toast({ title: 'Borrador generado', description: 'Los campos de contenido han sido actualizados.' });
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    });
  };

  const handleGenerateContent = () => {
    startContentTransition(async () => {
      const formData = new FormData();
      formData.append('textoBase', form.getValues('textoBase'));
      formData.append('tono', form.getValues('tono'));
      const result = await generateContentAction(initialFormState, formData);
      if (result.success && result.data?.content) {
        setValue('textoBase', result.data.content, { shouldValidate: true });
        toast({ title: 'Contenido optimizado', description: 'El texto unificado ha sido actualizado.' });
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    });
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('imageUrl', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <Form {...form}>
      <form action={publishFormAction} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Generación de Idea</CardTitle>
            <CardDescription>
              Usa una idea simple y un tono de voz para que la IA genere un borrador inicial del contenido.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="idea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idea o tema</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Lanzamiento de nuevo producto de skincare" {...field} />
                  </FormControl>
                  <FormDescription>
                    Describe brevemente sobre qué quieres escribir.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tono de Voz</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tono" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TONES.map(tone => (
                        <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="button" onClick={handleGenerateDraft} disabled={isDraftPending}>
              {isDraftPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generar Borrador
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Contenido Principal</CardTitle>
            <CardDescription>
              Define los elementos clave de tu publicación. Puedes editarlos manualmente o generarlos con IA.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="tituloInterno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título Interno</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Campaña Verano 2024 - Post 1" {...field} />
                  </FormControl>
                  <FormDescription>Un nombre para identificar esta publicación internamente.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="titular"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titular</FormLabel>
                  <FormControl>
                    <Input placeholder="El titular principal de tu publicación" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cuerpo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuerpo</FormLabel>
                  <FormControl>
                    <Textarea placeholder="El contenido principal de tu mensaje." className="min-h-[150px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Llamada a la Acción (CTA)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: ¡Compra ahora!, Más información aquí" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Imagen de la Publicación</FormLabel>
                    <FormControl>
                        <div className="flex flex-col items-center justify-center w-full">
                            <label 
                                htmlFor="dropzone-file" 
                                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80"
                            >
                                {imageUrl ? (
                                    <Image src={imageUrl} alt="Vista previa" width={200} height={200} className="object-contain h-48" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Haz clic para subir</span> o arrastra y suelta</p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF (MAX. 800x400px)</p>
                                    </div>
                                )}
                                <input id="dropzone-file" type="file" className="hidden" onChange={handleImageChange} accept="image/*" ref={fileInputRef} />
                            </label>
                        </div> 
                    </FormControl>
                    <FormDescription>Sube una imagen para acompañar tu publicación.</FormDescription>
                    <FormMessage />
                </FormItem>
              )}
            />

            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-lg">Texto Unificado y Optimización</CardTitle>
                    <CardDescription>
                        Este es el texto combinado que se enviará. Puedes optimizarlo con IA antes de guardar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                    control={form.control}
                    name="textoBase"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <Textarea readOnly className="min-h-[200px] bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </CardContent>
                <CardFooter>
                     <Button type="button" variant="outline" className="w-full" onClick={handleGenerateContent} disabled={isContentPending}>
                        {isContentPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Optimizar Texto Unificado con IA
                    </Button>
                </CardFooter>
            </Card>

          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" disabled={publishState.pending}>
              {publishState.pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Guardar y Enviar
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

    