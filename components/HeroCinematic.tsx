import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getRandomMineralImage } from "@/lib/mineral-images";

export default function HeroCinematic() {
  const mineralBg = getRandomMineralImage();
  
  return (
    <section className="relative min-h-[85vh] lg:min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#050509] via-[#101018] to-[#1A1A1D] dark:from-[#050509] dark:via-[#101018] dark:to-[#1A1A1D] light:from-neutral-100 light:via-neutral-50 light:to-white">
      {/* Mineral texture overlay - very subtle */}
      <div 
        className="absolute inset-0 opacity-[0.07] mix-blend-screen pointer-events-none bg-mineral"
        style={{ backgroundImage: `url(${mineralBg})` }}
      />
      
      {/* Background stars/particles */}
      <div className="absolute inset-0 overflow-hidden opacity-40 dark:opacity-40 light:opacity-20">
        <div className="absolute top-[10%] left-[5%] w-1 h-1 rounded-full bg-gold/60 animate-pulse" />
        <div className="absolute top-[25%] left-[15%] w-0.5 h-0.5 rounded-full bg-pyrite/50" />
        <div className="absolute top-[40%] left-[8%] w-1 h-1 rounded-full bg-gold/40 animate-pulse delay-75" />
        <div className="absolute top-[60%] left-[12%] w-0.5 h-0.5 rounded-full bg-pyrite/60" />
        <div className="absolute top-[75%] left-[6%] w-1 h-1 rounded-full bg-gold/50 animate-pulse delay-150" />
        <div className="absolute top-[20%] right-[8%] w-0.5 h-0.5 rounded-full bg-pyrite/70" />
        <div className="absolute top-[45%] right-[15%] w-1 h-1 rounded-full bg-gold/60 animate-pulse" />
        <div className="absolute top-[70%] right-[10%] w-0.5 h-0.5 rounded-full bg-pyrite/50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[85vh] lg:min-h-screen py-12 lg:py-0">
          {/* Left: Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight text-white dark:text-white light:text-neutral-900">
                Discover tomorrow&apos;s <span className="text-gold">critical minerals</span> — before they&apos;re found
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-neutral-300 dark:text-neutral-300 light:text-neutral-700 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                AI-powered mineral prospectivity mapping to accelerate exploration, reduce risk, and secure supply chains.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-gold hover:bg-gold/90 text-black dark:text-black light:text-black font-semibold text-base px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/prospectivity-brief">Request Prospectivity Brief</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-stone text-white dark:text-white light:text-neutral-900 hover:bg-stone/10 font-semibold text-base px-8 py-6 rounded-lg transition-all"
              >
                <Link href="/consultation">Book Consultation</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start items-center pt-4 text-sm text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-green-mineral animate-pulse" />
                <span>Validated by leading geologists</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-blue-accent animate-pulse delay-75" />
                <span>Trusted by exploration teams</span>
              </div>
            </div>
          </div>

          {/* Right: Globe Visual */}
          <div className="relative flex items-center justify-center">
            {/* Globe container */}
            <div className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] lg:w-[440px] lg:h-[440px] xl:w-[520px] xl:h-[520px]">
              {/* Central globe with radial gradient - dark mode */}
              <div className="absolute inset-0 rounded-full dark:bg-gradient-radial dark:from-[#1A1A1D] dark:via-[#0F0F13] dark:to-[#050509] light:bg-gradient-radial light:from-neutral-200 light:via-neutral-300 light:to-neutral-400 shadow-2xl dark:shadow-gold/20 light:shadow-neutral-400/30">
                {/* Inner glow */}
                <div className="absolute inset-[10%] rounded-full dark:bg-gradient-radial dark:from-gold/10 dark:via-transparent dark:to-transparent light:bg-gradient-radial light:from-gold/5 light:via-transparent light:to-transparent blur-xl" />
              </div>

              {/* Orbit rings */}
              <div className="absolute inset-[-20%] rounded-full border dark:border-stone/20 light:border-neutral-400/30 animate-spin-slow" />
              <div className="absolute inset-[-35%] rounded-full border dark:border-pyrite/15 light:border-neutral-300/25 animate-spin-slower" />
              <div className="absolute inset-[-50%] rounded-full border dark:border-gold/10 light:border-neutral-200/20 animate-spin-slowest" />

              {/* Mineral markers with pulse */}
              <div className="absolute top-[15%] right-[25%] w-3 h-3 rounded-full bg-gold shadow-lg shadow-gold/50">
                <div className="absolute inset-0 rounded-full bg-gold animate-ping opacity-75" />
              </div>
              <div className="absolute top-[40%] left-[10%] w-2.5 h-2.5 rounded-full bg-pyrite shadow-lg shadow-pyrite/50">
                <div className="absolute inset-0 rounded-full bg-pyrite animate-ping opacity-75 delay-75" />
              </div>
              <div className="absolute bottom-[30%] right-[15%] w-2 h-2 rounded-full bg-gold shadow-lg shadow-gold/50">
                <div className="absolute inset-0 rounded-full bg-gold animate-ping opacity-75 delay-150" />
              </div>
              <div className="absolute bottom-[20%] left-[30%] w-2.5 h-2.5 rounded-full bg-pyrite shadow-lg shadow-pyrite/50">
                <div className="absolute inset-0 rounded-full bg-pyrite animate-ping opacity-75" />
              </div>
              <div className="absolute top-[50%] right-[8%] w-2 h-2 rounded-full bg-gold shadow-lg shadow-gold/50">
                <div className="absolute inset-0 rounded-full bg-gold animate-ping opacity-75 delay-100" />
              </div>

              {/* Subtle texture/noise overlay */}
              <div className="absolute inset-0 rounded-full opacity-30 mix-blend-overlay dark:bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.3)_100%)] light:bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.1)_100%)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
