'use client';

import { useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormState } from 'react-dom';
import { CalendarIcon, Loader2, Sparkles, Send } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { CreatePostSchema, TONES, type CreatePostInput } from '@/lib/schemas';
import { generateDraftAction, generateContentAction, publishAction } from '@/app/actions';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/image-uploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
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
      tituloInterno: '',
      textoBase: '',
      tono: 'Persuasivo',
      imageUrl: '',
      publishMode: 'ahora',
      publishAt: undefined,
    },
  });

  const [publishState, publishFormAction] = useFormState(publishAction, initialFormState);

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
        form.setValue('textoBase', result.data.draft, { shouldValidate: true });
        toast({ title: 'Borrador generado', description: 'El texto base ha sido actualizado.' });
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
        form.setValue('textoBase', result.data.content, { shouldValidate: true });
        toast({ title: 'Contenido optimizado', description: 'El texto base ha sido actualizado con la versión final.' });
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    });
  };

  const watchPublishMode = form.watch('publishMode');

  return (
    <Form {...form}>
      <form action={publishFormAction} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Generación Rápida (Opcional)</CardTitle>
            <CardDescription>
              Usa una idea simple para que la IA genere un borrador inicial del contenido.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
          <CardFooter>
            <Button type="button" onClick={handleGenerateDraft} disabled={isDraftPending}>
              {isDraftPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generar Borrador Rápido
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Contenido Principal</CardTitle>
            <CardDescription>
              Define los elementos clave de tu publicación.
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
              name="textoBase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto Base</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Escribe tu contenido aquí o genera un borrador..." className="min-h-[200px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col sm:flex-row gap-4">
                <FormField
                control={form.control}
                name="tono"
                render={({ field }) => (
                    <FormItem className="flex-1">
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
                <div className="flex-1 flex items-end">
                    <Button type="button" variant="outline" className="w-full" onClick={handleGenerateContent} disabled={isContentPending}>
                    {isContentPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Optimizar con IA
                    </Button>
                </div>
            </div>

            <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Imagen de la Publicación</FormLabel>
                        <FormControl>
                            <ImageUploader {...field}/>
                        </FormControl>
                        <FormDescription>Pega la URL de una imagen para acompañar tu publicación.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Publicación</CardTitle>
            <CardDescription>
              Elige cómo y cuándo se enviará tu contenido al sistema de publicación.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="publishMode"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Modo de Publicación</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="ahora" />
                        </FormControl>
                        <FormLabel className="font-normal">Enviar ahora</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="programado" />
                        </FormControl>
                        <FormLabel className="font-normal">Programar para más tarde</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {watchPublishMode === 'programado' && (
              <FormField
                control={form.control}
                name="publishAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Publicación (Chile)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Elige una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      La publicación se programará en horario de Chile.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" aria-disabled={publishState.success}>
              <Send className="mr-2 h-4 w-4" />
              Guardar y Enviar
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
