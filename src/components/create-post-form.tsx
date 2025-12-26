'use client';

import { useEffect, useRef, useState, useActionState, useTransition } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles, Send, Upload, Facebook, Instagram } from 'lucide-react';
import Image from 'next/image';

import { CreatePostSchema, TONES, type CreatePostInput } from '@/lib/schemas';
import { generateDraftAction, generateContentAndPreviewsAction, publishAction } from '@/app/actions';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from './ui/skeleton';

const initialFormState = { message: '', errors: undefined, success: false, data: undefined };

const autoResizeTextarea = (element: HTMLTextAreaElement | null) => {
    if (element) {
        element.style.height = 'auto';
        element.style.height = `${element.scrollHeight}px`;
    }
};

export function CreatePostForm() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [previews, setPreviews] = useState({ facebook: '', instagram: '' });
  
  const form = useForm<CreatePostInput>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: {
      idea: '',
      tono: 'Persuasivo',
      tituloPublicacion: '',
      postType: 'articulo',
      ofertaDeValor: '',
      problemaSolucion: '',
      historiaContexto: '',
      conexionTerritorial: '',
      ctaSugerido: '',
      textoBase: '',
      imageUrl: '',
      nombreProducto: '',
      precio: '',
      descripcionProducto: '',
    },
    mode: 'onSubmit',
  });

  const { control, setValue, getValues, trigger, formState: { errors } } = form;

  const [draftState, draftFormAction, isDraftPending] = useActionState(generateDraftAction, initialFormState);
  const [contentState, contentFormAction, isContentPending] = useActionState(generateContentAndPreviewsAction, initialFormState);
  const [publishState, publishFormAction, isPublishPending] = useActionState(publishAction, initialFormState);
  
  const [_isPending, startTransition] = useTransition();

  const lastProcessedMessage = useRef<string | null>(null);

  const onGenerateDraft = async () => {
    const isValid = await trigger(["idea", "tono", "postType"]);
    if (isValid) {
      const formData = new FormData();
      const data = getValues();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      startTransition(() => {
        draftFormAction(formData);
      });
    }
  };


  const imageUrl = useWatch({ control, name: 'imageUrl' });
  const postType = useWatch({ control, name: 'postType' });

  const textoBaseRef = useRef<HTMLTextAreaElement>(null);
  const ofertaDeValorRef = useRef<HTMLTextAreaElement>(null);
  const problemaSolucionRef = useRef<HTMLTextAreaElement>(null);
  const historiaContextoRef = useRef<HTMLTextAreaElement>(null);
  const conexionTerritorialRef = useRef<HTMLTextAreaElement>(null);
  const descripcionProductoRef = useRef<HTMLTextAreaElement>(null);
  
  const allRefs = [ofertaDeValorRef, problemaSolucionRef, historiaContextoRef, conexionTerritorialRef, textoBaseRef, descripcionProductoRef];
  
  useEffect(() => {
    if (publishState.message && publishState.message !== lastProcessedMessage.current) {
      lastProcessedMessage.current = publishState.message;
      if (publishState.success) {
        toast({
          title: 'Éxito',
          description: publishState.message,
        });
        form.reset();
        setPreviews({ facebook: '', instagram: '' });
      } else {
         toast({
              title: 'Error',
              description: publishState.message,
              variant: 'destructive',
          });
      }
    }
  }, [publishState, toast, form]);

  useEffect(() => {
    if (draftState.message && draftState.message !== lastProcessedMessage.current) {
        lastProcessedMessage.current = draftState.message;
        if (draftState.success && draftState.data?.draft) {
            const draft = draftState.data.draft;
            const fieldMap: Record<string, keyof CreatePostInput> = {
                'Título de la publicación': 'tituloPublicacion',
                'Oferta de valor': 'ofertaDeValor',
                'Problema / solución': 'problemaSolucion',
                'Historia / contexto': 'historiaContexto',
                'Conexión territorial': 'conexionTerritorial',
                'CTA sugerido': 'ctaSugerido',
            };

            Object.entries(fieldMap).forEach(([fieldName, formKey]) => {
                const regex = new RegExp(`${fieldName}:(.*?)(?=\\n[A-Z][a-zA-ZÀ-ÿ ]* /:|\\n[A-Z][a-zA-ZÀ-ÿ ]*:|$)`, 's');
                const match = draft.match(regex);
                if (match) {
                    setValue(formKey, match[1].trim(), { shouldValidate: true, shouldDirty: true });
                }
            });
            
            requestAnimationFrame(() => {
                allRefs.forEach(ref => autoResizeTextarea(ref.current));
            });

            toast({ title: 'Borrador generado', description: 'Los campos de contenido han sido actualizados.' });
        } else if (!draftState.success) {
            toast({ title: 'Error', description: draftState.message, variant: 'destructive' });
        }
    }
  }, [draftState, setValue, toast, allRefs]);

  useEffect(() => {
    if (contentState.message && contentState.message !== lastProcessedMessage.current) {
        lastProcessedMessage.current = contentState.message;
        if (contentState.success && contentState.data) {
            if (contentState.data.optimizedContent) {
                setValue('textoBase', contentState.data.optimizedContent, { shouldValidate: true, shouldDirty: true });
                requestAnimationFrame(() => {
                    autoResizeTextarea(textoBaseRef.current);
                });
            }
            if (contentState.data.previews) {
                setPreviews(contentState.data.previews);
            }
            toast({ title: 'Contenido Generado', description: 'El contenido y las vistas previas han sido actualizados.' });
        } else if (!contentState.success) {
            toast({ title: 'Error de Contenido', description: contentState.message, variant: 'destructive' });
        }
    }
  }, [contentState, setValue, toast]);


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
      <form ref={formRef} action={publishFormAction} className="space-y-8">
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
            <FormField
              control={form.control}
              name="postType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Publicación</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="articulo">Artículo / Contenido</SelectItem>
                      <SelectItem value="producto">Producto / Venta</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Selecciona a qué categoría pertenece tu contenido.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {postType === 'producto' && (
                <div className="space-y-6 pt-4 border-t">
                    <FormField
                        control={form.control}
                        name="nombreProducto"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre del Producto</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: Crema Hidratante Pro" {...field} />
                                </FormControl>
                                <FormMessage>{errors.nombreProducto?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="precio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Precio</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: $24.990" {...field} />
                                </FormControl>
                                <FormMessage>{errors.precio?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="descripcionProducto"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descripción del Producto</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Describe brevemente el producto."
                                        className="resize-none overflow-hidden"
                                        {...field}
                                        onInput={(e) => {
                                            field.onChange(e);
                                            autoResizeTextarea(e.currentTarget);
                                        }}
                                        ref={(e) => {
                                            field.ref(e);
                                            descripcionProductoRef.current = e;
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="button" onClick={onGenerateDraft} disabled={isDraftPending}>
              {isDraftPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generar Borrador
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Contenido Principal</CardTitle>
            <CardDescription>
              Define los elementos clave de tu publicación. Puedes editarlos manually o generarlos con IA.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="tituloPublicacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título de la Publicación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Nueva Crema Hidratante para una Piel Radiante" {...field} />
                  </FormControl>
                  <FormDescription>Un título atractivo para tu publicación.</FormDescription>
                  <FormMessage>{errors.tituloPublicacion?.message}</FormMessage>
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
                  <FormMessage>{errors.ofertaDeValor?.message}</FormMessage>
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
                  <FormMessage>{errors.problemaSolucion?.message}</FormMessage>
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
                        <FormMessage>{errors.textoBase?.message}</FormMessage>
                        </FormItem>
                    )}
                    />
                </CardContent>
                <CardFooter className="flex-col items-stretch gap-4">
                     <Button
                      type="submit"
                      formAction={contentFormAction}
                      className="w-full"
                      disabled={isContentPending}
                    >
                        {isContentPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Optimizar Texto y Generar Vistas Previas
                    </Button>
                </CardFooter>
            </Card>

            {(previews.facebook || previews.instagram || isContentPending) && (
              <Card>
                <CardHeader>
                  <CardTitle>3. Vistas Previas</CardTitle>
                  <CardDescription>
                    Así es como se vería tu publicación en las diferentes plataformas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="facebook">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="facebook"><Facebook className="mr-2"/>Facebook</TabsTrigger>
                      <TabsTrigger value="instagram"><Instagram className="mr-2"/>Instagram</TabsTrigger>
                    </TabsList>
                    <div className="mt-4 p-4 border rounded-md min-h-[200px] bg-background">
                        {isContentPending ? (
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
                            </>
                        )}
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            )}

          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" disabled={isPublishPending}>
              {isPublishPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Guardar y Enviar
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

    