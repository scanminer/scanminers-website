import { getMineralImage } from "@/lib/mineral-images";

export function TechnologiesPipelineDiagram() {
  const minerals = {
    data: getMineralImage('copper'),
    harmonization: getMineralImage('nickel'),
    ai: getMineralImage('lithium'),
    prospectivity: getMineralImage('gold'),
    targets: getMineralImage('cobalt'),
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto py-12">
      {/* Pipeline Steps */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-2 relative">
        {/* Step 1: Data Sources */}
        <div className="relative">
          <div className="relative overflow-hidden bg-card dark:bg-card/80 border-2 border-primary/30 rounded-xl text-center transition-all hover:border-primary/60 hover:shadow-lg">
            {/* Mineral background */}
            <div 
              className="absolute inset-0 bg-mineral opacity-10"
              style={{ backgroundImage: `url(${minerals.data})` }}
            />
            <div className="absolute inset-0 bg-mineral-overlay" />
            
            {/* Content */}
            <div className="relative z-10 p-6">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-primary/20 mb-3">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="font-bold text-sm mb-2">Data Sources</h3>
              <p className="text-xs text-muted leading-relaxed">Satellite, airborne, geophysics, geochem</p>
            </div>
          </div>
          {/* Arrow for mobile */}
          <div className="md:hidden flex justify-center my-2">
            <svg className="h-6 w-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          {/* Arrow for desktop */}
          <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
            <svg className="h-6 w-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Step 2: Harmonization */}
        <div className="relative">
          <div className="relative overflow-hidden bg-card dark:bg-card/80 border-2 border-secondary/30 rounded-xl text-center transition-all hover:border-secondary/60 hover:shadow-lg">
            <div 
              className="absolute inset-0 bg-mineral opacity-10"
              style={{ backgroundImage: `url(${minerals.harmonization})` }}
            />
            <div className="absolute inset-0 bg-mineral-overlay" />
            
            <div className="relative z-10 p-6">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-secondary/20 mb-3">
                <svg className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="font-bold text-sm mb-2">Harmonization</h3>
              <p className="text-xs text-muted leading-relaxed">Preprocessing, calibration, fusion</p>
            </div>
          </div>
          <div className="md:hidden flex justify-center my-2">
            <svg className="h-6 w-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
            <svg className="h-6 w-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Step 3: AI Models */}
        <div className="relative">
          <div className="relative overflow-hidden bg-card dark:bg-card/80 border-2 border-accent/30 rounded-xl text-center transition-all hover:border-accent/60 hover:shadow-lg">
            <div 
              className="absolute inset-0 bg-mineral opacity-10"
              style={{ backgroundImage: `url(${minerals.ai})` }}
            />
            <div className="absolute inset-0 bg-mineral-overlay" />
            
            <div className="relative z-10 p-6">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-accent/20 mb-3">
                <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-bold text-sm mb-2">AI Models</h3>
              <p className="text-xs text-muted leading-relaxed">DPCA, ANN, gradient boosting</p>
            </div>
          </div>
          <div className="md:hidden flex justify-center my-2">
            <svg className="h-6 w-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
            <svg className="h-6 w-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Step 4: Prospectivity Maps */}
        <div className="relative">
          <div className="relative overflow-hidden bg-card dark:bg-card/80 border-2 border-gold/30 rounded-xl text-center transition-all hover:border-gold/60 hover:shadow-lg">
            <div 
              className="absolute inset-0 bg-mineral opacity-10"
              style={{ backgroundImage: `url(${minerals.prospectivity})` }}
            />
            <div className="absolute inset-0 bg-mineral-overlay" />
            
            <div className="relative z-10 p-6">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-gold/20 mb-3">
                <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="font-bold text-sm mb-2">Prospectivity</h3>
              <p className="text-xs text-muted leading-relaxed">Scored heatmaps, confidence bands</p>
            </div>
          </div>
          <div className="md:hidden flex justify-center my-2">
            <svg className="h-6 w-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
            <svg className="h-6 w-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Step 5: Drill Targets */}
        <div className="relative">
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-green-mineral/20 to-brand-blue-deep/20 border-2 border-brand-green-mineral/40 rounded-xl text-center transition-all hover:border-brand-green-mineral/70 hover:shadow-xl">
            <div 
              className="absolute inset-0 bg-mineral opacity-10"
              style={{ backgroundImage: `url(${minerals.targets})` }}
            />
            <div className="absolute inset-0 bg-mineral-overlay" />
            
            <div className="relative z-10 p-6">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-brand-green-mineral/30 mb-3">
                <svg className="h-6 w-6 text-brand-green-mineral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-sm mb-2">Drill Targets</h3>
              <p className="text-xs text-muted leading-relaxed">Ranked coordinates, field packets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted max-w-2xl mx-auto leading-relaxed">
          End-to-end pipeline transforms raw multi-sensor data into <strong className="text-fg">actionable drill coordinates</strong> in <strong className="text-fg">6-8 weeks</strong>, with transparent feature attribution at every step.
        </p>
      </div>
    </div>
  );
}
