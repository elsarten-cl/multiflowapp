import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DraftingCompass, Rocket, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Icons.logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">MultiPostFlow</span>
        </Link>
      </header>

      <main className="flex-grow">
        <section className="py-20 md:py-32 bg-hero-gradient">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="outline" className="mb-4">
              Potenciado por IA
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground mb-6 font-headline">
              Crea una vez, publica en todas partes.
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
              MultiPostFlow transforma tus ideas en contenido pulido para todas tus plataformas,
              ahorrándote tiempo y esfuerzo.
            </p>
            <Button size="lg" asChild>
              <Link href="/dashboard/create-post">Empezar a Crear</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Un flujo de trabajo de contenido simplificado
              </h2>
              <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
                Desde la idea hasta la publicación, MultiPostFlow te asiste en cada paso.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="transform hover:scale-105 transition-transform duration-300 shadow-lg">
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <DraftingCompass className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>1. Borrador Rápido</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Transforma una simple idea en un borrador estructurado en segundos,
                  gracias a nuestro generador de IA.
                </CardContent>
              </Card>
              <Card className="transform hover:scale-105 transition-transform duration-300 shadow-lg">
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Rocket className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>2. Generación Mágica</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Crea contenido optimizado para Facebook, Instagram y WordPress
                  con el tono y estilo que elijas.
                </CardContent>
              </Card>
              <Card className="transform hover:scale-105 transition-transform duration-300 shadow-lg">
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Share2 className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>3. Publicación Centralizada</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Guarda y publica tu contenido en todas tus plataformas desde un
                  único lugar, de forma automática.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="pb-20 md:pb-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative p-8 md:p-12 rounded-2xl bg-primary text-primary-foreground overflow-hidden">
              <div className="relative z-10 md:w-2/3">
                <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">
                  ¿Listo para optimizar tu contenido?
                </h2>
                <p className="text-lg text-primary-foreground/80 mb-6">
                  Únete a cientos de creadores que ya están ahorrando horas de trabajo
                  con MultiPostFlow.
                </p>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/dashboard/create-post">Ir al Creador</Link>
                </Button>
              </div>
              <Rocket className="absolute -right-10 -bottom-10 h-64 w-64 text-primary-foreground/10 transform rotate-[-20deg]" />
            </div>
          </div>
        </section>

      </main>

      <footer className="py-8 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Icons.logo className="h-6 w-6" />
            <span className="text-lg font-semibold">MultiPostFlow</span>
          </div>
          <p>&copy; {new Date().getFullYear()} MultiPostFlow. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
