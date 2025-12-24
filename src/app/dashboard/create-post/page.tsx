import { CreatePostFormClient } from '@/components/create-post-form-client';

export default function CreatePostPage() {
  return (
    <div className="container mx-auto max-w-5xl">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Creador de Contenido</h1>
            <p className="text-muted-foreground">
                Completa el formulario para generar y publicar tu contenido.
            </p>
        </div>
      <CreatePostFormClient />
    </div>
  );
}
