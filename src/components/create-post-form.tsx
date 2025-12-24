'use client';

import { useEffect, useTransition, useActionState, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles, Send, Upload, Facebook, Instagram, Wordpress } from 'lucide-react';
import Image from 'next/image';

import { CreatePostSchema, TONES, type CreatePostInput } from '@/lib/schemas';
import { generateDraftAction, generateContentAction, publishAction, generatePreviewAction } from '@/app/actions';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from './ui/skeleton';

const initialFormState = { message: '', errors: {}, success: false, pending: false };

const autoResizeTextarea = (element: HTMLTextAreaElement | null) => {
    if (element) {
        element.style.height = 'auto';
        element.style.height = `${element.scrollHeight}px`;
    }
};

export function CreatePostForm() {
  const { toast } = useToast();
  const [isDraftPending, startDraftTransition] = useTransition();
  const [isContentPending, startContentTransition] = useTransition();
  const [isPreviewPending, startPreviewTransition] = useTransition();

  const [previews, setPreviews] = useState({ facebook: '', instagram: '', wordpress: '' });
  
  const form = useForm<CreatePostInput>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: {
      idea: '',
      tono: 'Persuasivo',
      tituloInterno: '',
      postType: 'articulo',
      ofertaDeValor: '',
      problemaSolucion: '',
      historiaContexto: '',
      conexionTerritorial: '',
      ctaSugerido: '',
      textoBase: '',
      imageUrl: '',
    },
  });

  const { control, setValue, trigger, getValues, formState } = form;

  const ofertaDeValor = useWatch({ control, name: 'ofertaDeValor' });
  const problemaSolucion = useWatch({ control, name: 'problemaSolucion' });
  const historiaContexto = useWatch({ control, name: 'historiaContexto' });
  const conexionTerritorial = useWatch({ control, name: 'conexionTerritorial' });
  const ctaSugerido = useWatch({ control, name: 'ctaSugerido' });
  const imageUrl = useWatch({ control, name: 'imageUrl' });
  const textoBaseValue = useWatch({ control, name: 'textoBase' });

  const textoBaseRef = useRef<HTMLTextAreaElement>(null);
  const ofertaDeValorRef = useRef<HTMLTextAreaElement>(null);
  const problemaSolucionRef = useRef<HTMLTextAreaElement>(null);
  const historiaContextoRef = useRef<HTMLTextAreaElement>(null);
  const conexionTerritorialRef = useRef<HTMLTextAreaElement>(null);
  
  const allRefs = [ofertaDeValorRef, problemaSolucionRef, historiaContextoRef, conexionTerritorialRef, textoBaseRef];

  useEffect(() => {
    const unifiedText = [
      ofertaDeValor,
      problemaSolucion,
      historiaContexto,
      conexionTerritorial,
      ctaSugerido
    ].filter(Boolean).join('\n\n');
    if (getValues('textoBase') !== unifiedText) {
        setValue('textoBase', unifiedText, { shouldValidate: true, shouldDirty: true });
    }
  }, [ofertaDeValor, problemaSolucion, historiaContexto, conexionTerritorial, ctaSugerido, setValue, getValues]);

  useEffect(() => {
    requestAnimationFrame(() => autoResizeTextarea(textoBaseRef.current));
  }, [textoBaseValue]);


  const [publishState, publishFormAction] = useActionState(publishAction, initialFormState);

  useEffect(() => {
    if (publishState.message && !publishState.pending) {
        if(publishState.success) {
            toast({
                title: 'Éxito',
                description: publishState.message,
            });
            form.reset();
            setPreviews({ facebook: '', instagram: '', wordpress: '' });
        } else if (!publishState.errors) { // Show toast for general errors, not validation errors
            toast({
                title: 'Error',
                description: publishState.message,
                variant: 'destructive',
            });
        }
    }
    if (publishState.errors) {
        toast({
            title: 'Error de Validación',
            description: 'Por favor, corrige los errores en el formulario.',
            variant: 'destructive',
        });
    }
  }, [publishState, toast, form]);

  const handleGenerateDraft = () => {
    startDraftTransition(async () => {
      const formData = new FormData();
      formData.append('idea', form.getValues('idea') || '');
      formData.append('tono', form.getValues('tono'));
      const result = await generateDraftAction(initialFormState, formData);
      if (result.success && result.data?.draft) {
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
                setValue(key, match[1].trim(), { shouldValidate: true, shouldDirty: true });
            }
        });
        
        requestAnimationFrame(() => {
            allRefs.forEach(ref => autoResizeTextarea(ref.current));
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
        setValue('textoBase', result.data.content, { shouldValidate: true, shouldDirty: true });
        toast({ title: 'Contenido optimizado', description: 'El texto unificado ha sido actualizado.' });
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    });
  };
  
  const handleGeneratePreviews = () => {
      startPreviewTransition(async () => {
          const formData = new FormData();
          formData.append('textoBase', form.getValues('textoBase'));
          formData.append('tono', form.getValues('tono'));
          const result = await generatePreviewAction(initialFormState, formData);
          if (result.success && result.data) {
              setPreviews(result.data);
              toast({ title: 'Vistas previas generadas', description: 'Se generó el contenido para cada plataforma.' });
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
                  <FormMessage />
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
              control={control}
              name="postType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Publicación</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="articulo" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Artículo / Contenido
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="producto" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Producto / Venta
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>Selecciona a qué categoría pertenece tu contenido.</FormDescription>
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
                    <Textarea
                      placeholder="Describe la oferta de valor principal."
                      className="resize-none overflow-hidden"
                      {...field}
                      onInput={(e) => {
                          field.onChange(e);
                          autoResizeTextarea(e.currentTarget);
                      }}
                      ref={(e) => {
                        field.ref(e);
                        ofertaDeValorRef.current = e;
                      }}
                    />
                  </FormControl>
                  <FormMessage>{formState.errors.ofertaDeValor?.message}</FormMessage>
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
                    <Textarea
                      placeholder="Explica el problema que resuelves y cómo."
                      className="resize-none overflow-hidden"
                      {...field}
                      onInput={(e) => {
                          field.onChange(e);
                          autoResizeTextarea(e.currentTarget);
                      }}
                       ref={(e) => {
                        field.ref(e);
                        problemaSolucionRef.current = e;
                      }}
                    />
                  </FormControl>
                  <FormMessage>{formState.errors.problemaSolucion?.message}</FormMessage>
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
                    <Textarea
                      placeholder="Aporta contexto o una historia relevante."
                      className="resize-none overflow-hidden"
                      {...field}
                      onInput={(e) => {
                          field.onChange(e);
                          autoResizeTextarea(e.currentTarget);
                      }}
                       ref={(e) => {
                        field.ref(e);
                        historiaContextoRef.current = e;
                      }}
                    />
                  </FormControl>
                  <FormMessage>{formState.errors.historiaContexto?.message}</FormMessage>
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
                    <Textarea
                      placeholder="Crea una conexión con la audiencia local o territorial."
                      className="resize-none overflow-hidden"
                      {...field}
                      onInput={(e) => {
                          field.onChange(e);
                          autoResizeTextarea(e.currentTarget);
                      }}
                       ref={(e) => {
                        field.ref(e);
                        conexionTerritorialRef.current = e;
                      }}
                    />
                  </FormControl>
                  <FormMessage>{formState.errors.conexionTerritorial?.message}</FormMessage>
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
                  <FormMessage>{formState.errors.ctaSugerido?.message}</FormMessage>
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
                        Este es el texto combinado que se enviará. Puedes optimizarlo con IA o editarlo manualmente.
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
                                className="resize-none bg-background overflow-hidden" 
                                {...field}
                                onInput={(e) => {
                                    field.onChange(e);
                                    autoResizeTextarea(e.currentTarget);
                                }}
                                ref={(e) => {
                                    field.ref(e);
                                    textoBaseRef.current = e;
                                }}
                            />
                        </FormControl>
                        <FormMessage>{formState.errors.textoBase?.message}</FormMessage>
                        </FormItem>
                    )}
                    />
                </CardContent>
                <CardFooter className="flex-col items-stretch gap-4">
                     <Button type="button" variant="outline" className="w-full" onClick={handleGenerateContent} disabled={isContentPending}>
                        {isContentPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Optimizar Texto con IA
                    </Button>
                    <Button type="button" variant="outline" className="w-full" onClick={handleGeneratePreviews} disabled={isPreviewPending}>
                        {isPreviewPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generar Vistas Previas
                    </Button>
                </CardFooter>
            </Card>

            {(previews.facebook || previews.instagram || previews.wordpress || isPreviewPending) && (
              <Card>
                <CardHeader>
                  <CardTitle>3. Vistas Previas</CardTitle>
                  <CardDescription>
                    Así es como se vería tu publicación en las diferentes plataformas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="facebook">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="facebook"><Facebook className="mr-2"/>Facebook</TabsTrigger>
                      <TabsTrigger value="instagram"><Instagram className="mr-2"/>Instagram</TabsTrigger>
                      <TabsTrigger value="wordpress"><Wordpress className="mr-2"/>WordPress</TabsTrigger>
                    </TabsList>
                    <div className="mt-4 p-4 border rounded-md min-h-[200px] bg-background">
                        {isPreviewPending ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                                <Skeleton className="h-4 w-[220px]" />
                            </div>
                        ) : (
                            <>
                                <TabsContent value="facebook">
                                    <p className="whitespace-pre-wrap">{previews.facebook}</p>
                                </TabsContent>
                                <TabsContent value="instagram">
                                    <p className="whitespace-pre-wrap">{previews.instagram}</p>
                                </TabsContent>
                                <TabsContent value="wordpress">
                                    <p className="whitespace-pre-wrap">{previews.wordpress}</p>
                                </TabsContent>
                            </>
                        )}
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            )}

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
