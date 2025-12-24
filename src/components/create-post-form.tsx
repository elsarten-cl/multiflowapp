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

const initialFormState = { message: '', errors: {}, success: false, pending: false };

export function CreatePostForm() {
  const { toast } = useToast();
  const [isDraftPending, startDraftTransition] = useTransition();
  const [isContentPending, startContentTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const form = useForm<CreatePostInput>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: {
      idea: '',
      tono: 'Persuasivo',
      tituloInterno: '',
      ofertaDeValor: '',
      problemaSolucion: '',
      historiaContexto: '',
      conexionTerritorial: '',
      ctaSugerido: '',
      textoBase: '',
      imageUrl: '',
    },
  });

  const { control, setValue } = form;

  const ofertaDeValor = useWatch({ control, name: 'ofertaDeValor' });
  const problemaSolucion = useWatch({ control, name: 'problemaSolucion' });
  const historiaContexto = useWatch({ control, name: 'historiaContexto' });
  const conexionTerritorial = useWatch({ control, name: 'conexionTerritorial' });
  const ctaSugerido = useWatch({ control, name: 'ctaSugerido' });
  const imageUrl = useWatch({ control, name: 'imageUrl' });
  const textoBase = useWatch({ control, name: 'textoBase' });

  useEffect(() => {
    const unifiedText = [
      ofertaDeValor,
      problemaSolucion,
      historiaContexto,
      conexionTerritorial,
      ctaSugerido
    ].filter(Boolean).join('\n\n');
    setValue('textoBase', unifiedText, { shouldValidate: true, shouldDirty: true });
  }, [ofertaDeValor, problemaSolucion, historiaContexto, conexionTerritorial, ctaSugerido, setValue]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [textoBase]);

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
        // More robust parsing based on the expected structure
        const draft = result.data.draft;
        const fields = ['Oferta de valor', 'Problema / solución', 'Historia / contexto', 'Conexión territorial', 'CTA sugerido'];
        const fieldMap: Record<string, keyof CreatePostInput> = {
          'Oferta de valor': 'ofertaDeValor',
          'Problema / solución': 'problemaSolucion',
          'Historia / contexto': 'historiaContexto',
          'Conexión territorial': 'conexionTerritorial',
          'CTA sugerido': 'ctaSugerido',
        };
  
        fields.forEach(field => {
            const regex = new RegExp(`${field}:(.*?)(?=\n[A-Z]|$|\\n\\n)`, 's');
            const match = draft.match(regex);
            if (match) {
                const key = fieldMap[field];
                setValue(key, match[1].trim(), { shouldValidate: true });
            }
        });
        
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
              name="ofertaDeValor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Oferta de valor</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe la oferta de valor principal." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="problemaSolucion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problema / solución</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Explica el problema que resuelves y cómo." className="min-h-[150px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="historiaContexto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Historia / contexto</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Aporta contexto o una historia relevante." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="conexionTerritorial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conexión territorial</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Crea una conexión con la audiencia local o territorial." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ctaSugerido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CTA sugerido</FormLabel>
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
                                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF</p>
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
                    <CardTitle className="text-lg">Cuerpo Final</CardTitle>
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
                            <Textarea 
                                ref={textareaRef}
                                readOnly 
                                className="resize-none bg-background overflow-hidden" 
                                {...field} 
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </CardContent>
                <CardFooter>
                     <Button type="button" variant="outline" className="w-full" onClick={handleGenerateContent} disabled={isContentPending}>
                        {isContentPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Optimizar Texto con IA
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
