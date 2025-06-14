'use client';

import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface HeroCarouselProps {
  slides: {
    image: string;
    title: string;
    description: string;
    ctaText: string;
    ctaAction: () => void;
  }[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Auto-scroll every 5 seconds
  React.useEffect(() => {
    if (!emblaApi) return;
    
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900 z-10" />
      
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((slide, index) => (
            <div key={index} className="embla__slide relative flex-[0_0_100%] min-w-0">
              <div className="absolute inset-0 bg-black/50 z-10" />
              <Image 
                src={slide.image} 
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="relative z-20 flex flex-col items-center justify-center h-[80vh] text-center px-4">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 max-w-5xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {slide.title}
                </h1>
                <p className="text-white text-xl md:text-2xl max-w-3xl mx-auto mb-12 font-medium">
                  {slide.description}
                </p>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl shadow-blue-500/20 px-8 py-6 text-lg font-semibold"
                  onClick={slide.ctaAction}
                >
                  {slide.ctaText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation buttons */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full h-12 w-12"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full h-12 w-12"
        onClick={scrollNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
      
      {/* Dots indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${
              currentIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/50'
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
