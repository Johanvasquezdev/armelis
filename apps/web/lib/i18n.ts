export type Language = 'en' | 'es';

export interface I18nContent {
  nav: {
    liveConsole: string;
    showcase: string;
    platforms: string;
    howItWorks: string;
    docs: string;
    install: string;
    openSource: string;
    starGithub: string;
    coldMode: string;
    warmMode: string;
  };
  hero: {
    badge: string;
    title1: string;
    title2: string;
    lede: string;
    openConsole: string;
    exploreShowcase: string;
    copyInstall: string;
    copied: string;
    copy: string;
    badge1: string;
    badge2: string;
    badge3: string;
    traceTitle: string;
    taintedInput: string;
    taintedInputSub: string;
    chokePoint: string;
    chokePointSub: string;
    exfilSink: string;
    exfilSinkSub: string;
    remediationPr: string;
    remediationPrSub: string;
    severButton: string;
    pathSevered: string;
  };
  howItWorks: {
    eyebrow: string;
    title1: string;
    title2: string;
    step1Num: string;
    step1Title: string;
    step1Desc: string;
    step2Num: string;
    step2Title: string;
    step2Desc: string;
    step3Num: string;
    step3Title: string;
    step3Desc: string;
  };
  showcase: {
    eyebrow: string;
    title: string;
    tabVideo: string;
    tabPhotos: string;
    nowPlaying: string;
    pause: string;
    play: string;
    mute: string;
    unmute: string;
    clickToZoom: string;
    videoChapters: Array<{
      title: string;
      subtitle: string;
      desc: string;
    }>;
    photoItems: Array<{
      title: string;
      subtitle: string;
      badge: string;
      specs: string;
      desc: string;
      details: string[];
    }>;
  };
  comparison: {
    eyebrow: string;
    title1: string;
    title2: string;
    legacyTitle: string;
    legacyTag: string;
    legacyPoints: string[];
    armelisTitle: string;
    armelisTag: string;
    armelisPoints: string[];
  };
  features: {
    eyebrow: string;
    title: string;
    items: Array<{
      title: string;
      desc: string;
    }>;
  };
  aiVibecoding: {
    eyebrow: string;
    title: string;
    subtitle: string;
    card1Badge: string;
    card1Title: string;
    card1Desc: string;
    card2Badge: string;
    card2Title: string;
    card2Desc: string;
    card3Badge: string;
    card3Title: string;
    card3Desc: string;
    promptTitle: string;
    promptDesc: string;
    promptSnippet: string;
    ctaConsole: string;
  };
  docs: {
    eyebrow: string;
    title: string;
    subtitle: string;
    tabCli: string;
    tabGraph: string;
    tabSiem: string;
    tabCicd: string;
    cliTitle: string;
    cliDesc: string;
    graphTitle: string;
    graphDesc: string;
    siemTitle: string;
    siemDesc: string;
    cicdTitle: string;
    cicdDesc: string;
    copySnippet: string;
  };
  platforms: {
    eyebrow: string;
    title: string;
    tabCli: string;
    tabDesktop: string;
    cliHeading: string;
    cliP1: string;
    cliP2: string;
    desktopHeading: string;
    desktopP1: string;
    desktopP2: string;
    downloadInstaller: string;
    githubReleases: string;
    buildFromSource: string;
  };
  openSource: {
    eyebrow: string;
    title: string;
    desc: string;
    readLicense: string;
    viewSource: string;
  };
  install: {
    eyebrow: string;
    title: string;
    tabCli: string;
    tabDesktop: string;
    tabDocker: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    desktopStep1Title: string;
    desktopStep1Desc: string;
    desktopStep2Title: string;
    desktopStep2Desc: string;
    dockerStep1Title: string;
    dockerStep1Desc: string;
    dockerStep2Title: string;
    dockerStep2Desc: string;
    launchConsole: string;
  };
  footer: {
    tagline: string;
    privacy: string;
    terms: string;
    license: string;
    credit: string;
  };
  lightbox: {
    highlights: string;
    close: string;
  };
}

export const translations: Record<Language, I18nContent> = {
  en: {
    nav: {
      liveConsole: 'Live Console ↗',
      showcase: 'Demo & Videos',
      platforms: 'CLI & Desktop',
      howItWorks: 'How it works',
      docs: 'Documentation',
      install: 'Activation & Download',
      openSource: 'Open Source',
      starGithub: 'Star on GitHub',
      coldMode: 'Cold',
      warmMode: 'Warm'
    },
    hero: {
      badge: 'CYBERSECURITY & DEVSECOPS INTELLIGENCE',
      title1: 'Map the attack path.',
      title2: 'Kill the breach before compile.',
      lede: 'Traditional scanners vomit 800 unprioritized CVE alerts into a spreadsheet. Armelis synthesizes dependency trees, SAST tainted sinks, and network exposures into a single deterministic attack graph — revealing the exact choke point to sever.',
      openConsole: 'Open Live Console',
      exploreShowcase: 'Explore Showcase',
      copyInstall: 'npm install -g @armelis/cli',
      copied: 'Copied! ✓',
      copy: 'Copy',
      badge1: '3.4M+ Nodes Analyzed',
      badge2: '100% Local / Zero Telemetry',
      badge3: 'MITRE ATT&CK Correlated',
      traceTitle: 'ARMELIS DETERMINISTIC GRAPH ENGINE',
      taintedInput: 'Tainted Input',
      taintedInputSub: 'HTTP POST /api/v1/auth/callback',
      chokePoint: 'Choke Point',
      chokePointSub: 'CVE-2025-4128 • jsonwebtoken',
      exfilSink: 'Exfiltration Sink',
      exfilSinkSub: 'PostgreSQL Prod Pool',
      remediationPr: 'Remediation PR',
      remediationPrSub: 'Break path with 1 patch',
      severButton: 'Sever Choke Point ✂',
      pathSevered: 'Path Severed ✓'
    },
    howItWorks: {
      eyebrow: 'Triaged Pipeline Architecture',
      title1: 'Three lenses.',
      title2: 'One unified attack trajectory.',
      step1Num: '01',
      step1Title: 'Deterministic Ingestion',
      step1Desc: 'Parses lockfiles, AST syntax trees, and container topologies locally in pure Rust/Node with zero cloud telemetry leakage.',
      step2Num: '02',
      step2Title: 'Graph Synthesis & Choke Points',
      step2Desc: 'Correlates public vulnerabilities with actual reachable execution paths, isolating the single dependency to patch.',
      step3Num: '03',
      step3Title: 'Real-Time SIEM & CI Enforcement',
      step3Desc: 'Emits normalized CEF & Elastic ECS alerts directly into Splunk, Microsoft Sentinel, or blocks breaking PRs in GitHub Actions.'
    },
    showcase: {
      eyebrow: 'PRODUCT SHOWCASE • SYSTEM DEMOS',
      title: 'See Armelis In Action',
      tabVideo: 'Interactive Video Tour',
      tabPhotos: 'HD Screenshots & Captures',
      nowPlaying: 'Now playing',
      pause: 'Pause',
      play: 'Play',
      mute: 'Mute',
      unmute: 'Unmute',
      clickToZoom: 'Click image to inspect high-resolution architecture specs ↗',
      videoChapters: [
        {
          title: '01 Graph Synthesis',
          subtitle: 'Attack path mapping & choke point visualization',
          desc: 'Observe how Armelis collapses 400+ disconnected package vulnerabilities into a single traversable graph from HTTP ingress to database sink.'
        },
        {
          title: '02 Taint Analysis',
          subtitle: 'Tracking unsanitized input to database sinks',
          desc: 'Watch real-time AST lexical flow tracing parameter pollution through middleware, controller dispatchers, and ORM query builders.'
        },
        {
          title: '03 SIEM Forwarding',
          subtitle: 'CEF & Elastic ECS real-time telemetry stream',
          desc: 'Instant emission of Common Event Format (CEF) and Elastic Common Schema (ECS) payloads to SOC syslog collectors and Splunk indexers.'
        },
        {
          title: '04 CI/CD Pipeline Gate',
          subtitle: 'Zero-exit GitHub Actions and SARIF upload',
          desc: 'Fails pull requests only when an exploit path is mathematically verified reachable, eradicating false positive developer friction.'
        }
      ],
      photoItems: [
        {
          title: 'Multi-tier Attack Graph Topology',
          subtitle: 'Visualizing reachability from public HTTP endpoints down to deep database sinks.',
          badge: 'GRAPH ENGINE',
          specs: 'SVG Canvas • D3 Force Simulation • Sub-second rendering',
          desc: 'Eliminates flat vulnerability spreadsheets. Armelis renders every dependency and tainted code sink in an interactive directional acyclic graph (DAG), highlighting the critical choke point that breaks the entire attack chain.',
          details: [
            'Dynamic path highlighting with visual pulse animations',
            'Instant filtering by severity (Critical, High, Medium)',
            'Interactive node selection with side-by-side threat drawer'
          ]
        },
        {
          title: 'Deep Dependency AST & CVE Reachability',
          subtitle: 'Correlating OSV.dev and GitHub advisories with actual call-tree execution paths.',
          badge: 'AST ANALYZER',
          specs: 'Babel / SWC Parser • Call-graph tracing • Offline cache',
          desc: 'Standard scanners trigger on vulnerable packages even if their vulnerable functions are never called. Armelis traces AST call trees to verify whether your application code actually invokes the vulnerable symbol.',
          details: [
            'Zero false positives for dormant or unused transitive dependencies',
            'Full support for package.json, Cargo.lock, poetry.lock, and pom.xml',
            'Calculates minimal semver bump to fix vulnerabilities without breakage'
          ]
        },
        {
          title: 'Enterprise SIEM Telemetry Bridge',
          subtitle: 'Streaming CEF, Elastic ECS, and RFC 5424 Syslog events straight to your SOC.',
          badge: 'SIEM STREAMER',
          specs: 'CEF v0.1 • Elastic ECS 8.x • RFC 5424 Syslog UDP/TCP',
          desc: 'Armelis acts as an edge security sensor, formatting every detected attack path into industry-standard event payloads ready for ingest by Splunk, Microsoft Sentinel, Datadog, or Elasticsearch.',
          details: [
            'One-click clipboard export for quick incident response triage',
            'Batch streaming mode for automated CI pipeline telemetry',
            'Redacted payloads to prevent accidental secret leakage in logs'
          ]
        },
        {
          title: 'Automated Remediation & Code Diffs',
          subtitle: 'Generating deterministic code patches and 1-click AI prompts for fast fixes.',
          badge: 'REMEDIATION',
          specs: 'Unified Diff • AST patch generator • Copilot / Cursor prompt',
          desc: 'Fix vulnerabilities in seconds rather than days. Armelis generates exact before-and-after code diffs and pre-formatted AI prompts you can drop directly into Cursor, GitHub Copilot, or Claude.',
          details: [
            'Syntax-highlighted diffs showing unsafe vs sanitized implementations',
            'Pre-tuned prompts containing CVE context, mitigation steps, and test cases',
            'One-click "Copy Prompt" with instant visual feedback'
          ]
        }
      ]
    },
    comparison: {
      eyebrow: 'Sample scan / SOC triage',
      title1: 'Path over',
      title2: 'pile.',
      legacyTitle: 'Legacy Scanners (Noise)',
      legacyTag: 'HIGH ALERT FATIGUE',
      legacyPoints: [
        '412 unprioritized CVE alerts in a sprawling spreadsheet',
        '92% false positives originating from unreachable dormant code',
        'Manual triage fatigue burns out SOC and engineering teams',
        'Days spent debating whether a vulnerable library is actually executed'
      ],
      armelisTitle: 'Armelis Engine (Deterministic)',
      armelisTag: 'ACTIONABLE CERTAINTY',
      armelisPoints: [
        '1 correlated, mathematically proven attack trajectory',
        'Taint flow verified from external HTTP ingress to SQL database sink',
        '1 single choke point dependency identified to sever the entire path',
        'Immediate SARIF upload & 1-click remediation pull request'
      ]
    },
    features: {
      eyebrow: 'Enterprise Capabilities',
      title: 'Engineered for speed, precision, and zero noise.',
      items: [
        {
          title: 'Taint Sink Verification',
          desc: 'Traces untrusted request parameters across AST syntax trees to verify whether vulnerable functions can actually execute.'
        },
        {
          title: 'Air-Gapped & Offline Ready',
          desc: 'Runs 100% locally on developer laptops or isolated corporate on-premise clusters with zero internet dependency.'
        },
        {
          title: 'Native SIEM Formatters',
          desc: 'Outputs RFC 5424 Syslog, ArcSight CEF, and Elastic ECS out of the box with zero transformation scripts needed.'
        },
        {
          title: 'Autonomous Patch Synthesis',
          desc: 'Calculates the minimal version increment that severs the attack path without breaking semantic version APIs.'
        }
      ]
    },
    aiVibecoding: {
      eyebrow: 'THE AI & VIBECODING SECURITY BLINDSPOT',
      title: 'Nobody knows what AI just wrote. Armelis proves whether it can be breached.',
      subtitle: 'When developers vibecode applications at lightning speed using Cursor, GitHub Copilot, and Claude Code, security becomes an invisible gamble. Traditional scanners scream at 800 unexploitable lines, while real injection paths slip into production. Armelis brings deterministic reachability defense to AI workflows.',
      card1Badge: '01 • THE VIBECODING REALITY',
      card1Title: '100x Output, 0x Line-by-Line Review',
      card1Desc: 'AI models assemble full-stack apps in minutes, silently hallucinating outdated dependencies, omitting session authorization checks, and connecting untrusted parameters straight to database sinks.',
      card2Badge: '02 • THE SCANNER DILEMMA',
      card2Title: 'Legacy Scanners Kill the Flow',
      card2Desc: 'Throwing 600 static CVE alerts at a vibecoder causes instant alert blindness. Developers dismiss the noise and push vulnerable code to production anyway.',
      card3Badge: '03 • THE ARMELIS HARNESS',
      card3Title: 'Deterministic AST Reachability',
      card3Desc: "Armelis traces the live execution tree from public ingress to sink. If the vulnerability can't be reached, it stays silent. If it can, it isolates the exact choke point and hands you a 1-click prompt to paste back to your AI to fix it in seconds.",
      promptTitle: '1-Click AI Remediation Prompt',
      promptDesc: 'Feed Armelis findings directly back into Cursor, Copilot, or Claude Code to fix the choke point without breaking your sprint velocity.',
      promptSnippet: `Fix critical choke point in package.json and controllers/auth.ts:
- Upgrade jsonwebtoken from 8.5.1 to ^9.0.2 (CVE-2025-4128)
- Enforce explicit algorithms: ['RS256'] in jwt.verify()
- Verify req.user.tenantId matches order.tenantId before DB query execution`,
      ctaConsole: 'Test an AI-Generated Repo in Live Console →'
    },
    docs: {
      eyebrow: 'TECHNICAL DOCUMENTATION',
      title: 'Developer & SecOps Guide',
      subtitle: 'Everything you need to scan repositories, construct attack graphs, forward telemetry to SIEM, and gate CI/CD pipelines.',
      tabCli: 'CLI Quickstart',
      tabGraph: 'Attack Graph Engine',
      tabSiem: 'SIEM Integration',
      tabCicd: 'CI/CD Quality Gate',
      cliTitle: 'Terminal & Command-Line Scanning',
      cliDesc: 'Install the lightweight binary or npm package to scan local repositories, generate SARIF reports, and compute reachability scores locally.',
      graphTitle: 'Deterministic Attack Graph Architecture',
      graphDesc: 'How Armelis synthesizes lockfiles, AST call trees, and tainted execution sinks into directed acyclic graphs to find the exact choke point.',
      siemTitle: 'Enterprise SIEM & SOC Telemetry Bridge',
      siemDesc: 'Forward structured CEF (Common Event Format) and Elastic ECS payloads directly to Splunk, Microsoft Sentinel, or Elasticsearch.',
      cicdTitle: 'Automated GitHub Actions Quality Gate',
      cicdDesc: 'Block pull requests deterministically only when reachability from external ingress to vulnerable sink is mathematically proven.',
      copySnippet: 'Copy snippet'
    },
    platforms: {
      eyebrow: 'Cross-Platform Ecosystem',
      title: 'Run anywhere. From terminal to desktop.',
      tabCli: 'Armelis CLI (Terminal & CI)',
      tabDesktop: 'Armelis Desktop (Windows)',
      cliHeading: 'Fast, Headless Security for Developers & CI/CD',
      cliP1: 'Built in Node & Rust, Armelis CLI is designed for speed. Run deep AST reachability analysis across any repository in seconds, stream results directly to stdout, or output standard SARIF files for GitHub Code Scanning.',
      cliP2: 'Zero configuration required. Point to any directory containing package.json, Cargo.lock, or poetry.lock to begin graph synthesis.',
      desktopHeading: 'Tactical Security Command Center for Windows',
      desktopP1: 'A high-performance visual command center designed for security architects and SOC teams. Features interactive DAG attack graphs, live SIEM telemetry docks, and 1-click code remediation diffs.',
      desktopP2: 'Includes an Exposure Gauge HUD that reacts dynamically as you sever choke points, validating real-time risk reduction.',
      downloadInstaller: 'Download Windows Setup (EXE)',
      githubReleases: 'GitHub Releases',
      buildFromSource: 'Build from Source'
    },
    openSource: {
      eyebrow: 'Freedom & Transparency',
      title: '100% Free & Open Source.',
      desc: 'Armelis is free software licensed under the permissive MIT License. Inspect every line of code, run it completely offline, and build custom security integrations with full confidence.',
      readLicense: 'Read MIT License',
      viewSource: 'View Source Code on GitHub'
    },
    install: {
      eyebrow: 'Instant Setup',
      title: 'Get started in 30 seconds.',
      tabCli: 'Armelis CLI',
      tabDesktop: 'Windows Desktop',
      tabDocker: 'Docker Container',
      step1Title: 'Global Installation',
      step1Desc: 'Install the Armelis CLI globally via npm or pnpm:',
      step2Title: 'Scan Any Local Repository',
      step2Desc: 'Run a deep deterministic reachability scan on your current directory:',
      step3Title: 'Export to SARIF or SIEM Format',
      step3Desc: 'Generate reports compatible with GitHub Security or SOC collectors:',
      desktopStep1Title: 'Download Windows Setup Executable',
      desktopStep1Desc: 'Get the official standalone NSIS installer from GitHub Releases:',
      desktopStep2Title: 'Build from Source (Alternative)',
      desktopStep2Desc: 'Clone the repository and compile the Electron desktop bundle locally:',
      dockerStep1Title: 'Pull Official Container Image',
      dockerStep1Desc: 'Retrieve the pre-built multi-arch container image:',
      dockerStep2Title: 'Mount Local Repository & Scan',
      dockerStep2Desc: 'Mount any local directory without installing Node or Rust on the host:',
      launchConsole: 'Launch Live Console'
    },
    footer: {
      tagline: 'ARMELIS • APPLICATION SECURITY INTELLIGENCE',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      license: 'MIT License',
      credit: 'DEVELOPED BY JOHAN VASQUEZ'
    },
    lightbox: {
      highlights: 'Architectural Highlights',
      close: 'Close'
    }
  },
  es: {
    nav: {
      liveConsole: 'Consola en Vivo ↗',
      showcase: 'Demos y Videos',
      platforms: 'CLI y Escritorio',
      howItWorks: 'Cómo funciona',
      docs: 'Documentación',
      install: 'Instalación y Descargas',
      openSource: 'Código Abierto',
      starGithub: 'Destacar en GitHub',
      coldMode: 'Frío',
      warmMode: 'Cálido'
    },
    hero: {
      badge: 'INTELIGENCIA EN CIBERSEGURIDAD Y DEVSECOPS',
      title1: 'Mapea la ruta de ataque.',
      title2: 'Neutraliza la brecha antes de compilar.',
      lede: 'Los escáneres tradicionales arrojan cientos de alertas CVE desordenadas en una hoja de cálculo. Armelis sintetiza árboles de dependencias, sumideros SAST comprometidos y exposición de red en un grafo determinista de ataque, revelando el punto exacto de estrangulamiento para neutralizar la amenaza.',
      openConsole: 'Abrir Consola en Vivo',
      exploreShowcase: 'Explorar Demos',
      copyInstall: 'npm install -g @armelis/cli',
      copied: '¡Copiado! ✓',
      copy: 'Copiar',
      badge1: 'Más de 3.4M Nodos Analizados',
      badge2: '100% Local / Cero Telemetría',
      badge3: 'Correlación con MITRE ATT&CK',
      traceTitle: 'MOTOR DE GRAFOS DETERMINISTA ARMELIS',
      taintedInput: 'Entrada Contaminada',
      taintedInputSub: 'HTTP POST /api/v1/auth/callback',
      chokePoint: 'Punto de Estrangulamiento',
      chokePointSub: 'CVE-2025-4128 • jsonwebtoken',
      exfilSink: 'Sumidero de Exfiltración',
      exfilSinkSub: 'Pool de Producción PostgreSQL',
      remediationPr: 'PR de Remediación',
      remediationPrSub: 'Rompe la ruta con 1 parche',
      severButton: 'Cortar Punto Crítico ✂',
      pathSevered: 'Ruta Cortada ✓'
    },
    howItWorks: {
      eyebrow: 'Arquitectura de Inspección Triagilizada',
      title1: 'Tres lentes.',
      title2: 'Una trayectoria de ataque unificada.',
      step1Num: '01',
      step1Title: 'Ingesta Determinista',
      step1Desc: 'Analiza archivos lockfile, árboles de sintaxis AST y topologías de contenedores de forma local con cero fuga de telemetría a la nube.',
      step2Num: '02',
      step2Title: 'Síntesis de Grafos y Puntos Críticos',
      step2Desc: 'Correlaciona vulnerabilidades públicas con rutas de ejecución alcanzables, aislando la dependencia clave a parchear.',
      step3Num: '03',
      step3Title: 'Telemetría SIEM y Bloqueo en CI',
      step3Desc: 'Emite alertas normalizadas CEF y Elastic ECS hacia Splunk, Microsoft Sentinel o bloquea pull requests críticos en GitHub Actions.'
    },
    showcase: {
      eyebrow: 'DEMOSTRACIÓN DE PRODUCTO • DEMOS DEL SISTEMA',
      title: 'Mira a Armelis en Acción',
      tabVideo: 'Tour Interactivo en Video',
      tabPhotos: 'Capturas y Fotos en HD',
      nowPlaying: 'Reproduciendo',
      pause: 'Pausar',
      play: 'Reproducir',
      mute: 'Silenciar',
      unmute: 'Activar sonido',
      clickToZoom: 'Haz clic en la imagen para inspeccionar especificaciones técnicas en HD ↗',
      videoChapters: [
        {
          title: '01 Síntesis de Grafos',
          subtitle: 'Mapeo de rutas de ataque y visualización de puntos críticos',
          desc: 'Observa cómo Armelis sintetiza más de 400 vulnerabilidades dispersas en un solo grafo navegable desde el ingreso HTTP hasta la base de datos.'
        },
        {
          title: '02 Análisis de Contaminación',
          subtitle: 'Rastreo de entradas no saneadas hacia sumideros de base de datos',
          desc: 'Visualiza el flujo léxico AST en tiempo real rastreando la polución de parámetros a través de middleware, controladores y consultas ORM.'
        },
        {
          title: '03 Reenvío a SIEM',
          subtitle: 'Flujo de telemetría en tiempo real con CEF y Elastic ECS',
          desc: 'Emisión instantánea de eventos en formato CEF y Elastic ECS directamente hacia colectores syslog del SOC e indexadores de Splunk.'
        },
        {
          title: '04 Puerta de Calidad en CI/CD',
          subtitle: 'Bloqueo estricto en GitHub Actions y subida SARIF',
          desc: 'Falla los pull requests únicamente cuando la ruta del exploit es matemáticamente alcanzable, eliminando la fatiga de falsos positivos.'
        }
      ],
      photoItems: [
        {
          title: 'Topología de Grafo de Ataque Multicapa',
          subtitle: 'Visualización de alcance desde endpoints HTTP públicos hasta bases de datos críticas.',
          badge: 'MOTOR DE GRAFO',
          specs: 'Lienzo SVG • Simulación D3 Force • Renderizado sub-segundo',
          desc: 'Elimina las listas planas de vulnerabilidades. Armelis representa cada dependencia y sumidero comprometido en un grafo acíclico dirigido (DAG) interactivo, resaltando el punto crítico que interrumpe la cadena completa.',
          details: [
            'Resaltado dinámico de rutas con animaciones de pulso visual',
            'Filtrado instantáneo por severidad (Crítica, Alta, Media)',
            'Selección interactiva de nodos con panel lateral de amenazas'
          ]
        },
        {
          title: 'AST Profundo de Dependencias y Alcance de CVEs',
          subtitle: 'Correlación de avisos OSV.dev y GitHub con rutas reales de ejecución en el árbol de llamadas.',
          badge: 'ANALIZADOR AST',
          specs: 'Parser Babel / SWC • Trazado de llamadas • Caché local offline',
          desc: 'Los escáneres comunes alertan sobre paquetes vulnerables incluso si sus funciones afectadas nunca son ejecutadas. Armelis analiza el árbol sintáctico AST para comprobar si tu código realmente invoca el símbolo vulnerable.',
          details: [
            'Cero falsos positivos en dependencias transitivas inactivas o no usadas',
            'Soporte completo para package.json, Cargo.lock, poetry.lock y pom.xml',
            'Calcula la actualización semver mínima para resolver vulnerabilidades sin romper compatibilidad'
          ]
        },
        {
          title: 'Puente de Telemetría SIEM Empresarial',
          subtitle: 'Transmisión de eventos CEF, Elastic ECS y Syslog RFC 5424 directo a tu SOC.',
          badge: 'TRANSMISOR SIEM',
          specs: 'CEF v0.1 • Elastic ECS 8.x • Syslog RFC 5424 UDP/TCP',
          desc: 'Armelis actúa como un sensor de seguridad perimetral, transformando cada ruta de ataque detectada en estructuras estándar listas para su ingesta en Splunk, Microsoft Sentinel, Datadog o Elasticsearch.',
          details: [
            'Exportación al portapapeles en 1 clic para triaje rápido de incidentes',
            'Modo de flujo por lotes para telemetría automatizada en pipelines CI',
            'Carga útil sanitizada para prevenir fuga accidental de secretos en logs'
          ]
        },
        {
          title: 'Remediación Automatizada y Diffs de Código',
          subtitle: 'Generación de parches deterministas y prompts de IA en 1 clic para soluciones rápidas.',
          badge: 'REMEDIACIÓN',
          specs: 'Unified Diff • Generador de parches AST • Prompts Copilot / Cursor',
          desc: 'Soluciona vulnerabilidades en segundos en vez de días. Armelis genera comparativas de código antes/después y prompts estructurados listos para insertar en Cursor, GitHub Copilot o Claude.',
          details: [
            'Diffs con sintaxis coloreada mostrando implementaciones inseguras vs saneadas',
            'Prompts optimizados con contexto CVE, pasos de mitigación y casos de prueba',
            'Botón de 1 clic "Copiar Prompt" con confirmación visual instantánea'
          ]
        }
      ]
    },
    comparison: {
      eyebrow: 'Escaneo de Muestra / Triaje SOC',
      title1: 'Ruta clara,',
      title2: 'no montañas de alertas.',
      legacyTitle: 'Escáneres Heredados (Ruido)',
      legacyTag: 'ALTA FATIGA DE ALERTAS',
      legacyPoints: [
        '412 alertas CVE desordenadas en una hoja de cálculo interminable',
        '92% de falsos positivos en código dormido o inalcanzable',
        'Fatiga de triaje manual que agota a los equipos de ingeniería y SOC',
        'Días perdidos debatiendo si una librería afectada realmente se ejecuta'
      ],
      armelisTitle: 'Motor Armelis (Determinista)',
      armelisTag: 'CERTEZA ACCIONABLE',
      armelisPoints: [
        '1 trayectoria de ataque confirmada y correlacionada matemáticamente',
        'Flujo de contaminación validado desde la entrada HTTP hasta la base de datos SQL',
        '1 solo punto de estrangulamiento identificado para neutralizar toda la cadena',
        'Subida SARIF automatizada y PR de remediación en 1 solo clic'
      ]
    },
    features: {
      eyebrow: 'Capacidades Empresariales',
      title: 'Diseñado para velocidad, precisión y cero ruido.',
      items: [
        {
          title: 'Verificación de Sumideros Contaminados',
          desc: 'Rastrea parámetros de solicitudes no confiables a través de árboles AST para verificar si las funciones vulnerables pueden ejecutarse realmente.'
        },
        {
          title: 'Listo para Entornos Air-Gapped y Offline',
          desc: 'Se ejecuta 100% de manera local en laptops de desarrolladores o clústeres corporativos aislados sin conexión a internet.'
        },
        {
          title: 'Formatos Nativos para SIEM',
          desc: 'Genera Syslog RFC 5424, ArcSight CEF y Elastic ECS de forma nativa sin requerir scripts adicionales de transformación.'
        },
        {
          title: 'Síntesis Autónoma de Parches',
          desc: 'Calcula el incremento de versión mínimo que rompe la ruta de ataque sin alterar la compatibilidad de APIs semver.'
        }
      ]
    },
    aiVibecoding: {
      eyebrow: 'EL PUNTO CIEGO DE LA IA Y EL VIBECODING',
      title: 'Nadie sabe qué acaba de escribir la IA. Armelis demuestra si realmente es vulnerable.',
      subtitle: 'Cuando los desarrolladores programan a la velocidad de la luz mediante "vibecoding" con Cursor, Copilot y Claude Code, la seguridad se vuelve una ruleta rusa. Los escáneres viejos gritan por 800 líneas inofensivas mientras brechas críticas pasan a producción. Armelis devuelve la certeza determinista al desarrollo con IA.',
      card1Badge: '01 • LA REALIDAD DEL VIBECODING',
      card1Title: 'Producción a 100x, Revisión a 0x',
      card1Desc: 'Los modelos de IA crean aplicaciones completas en minutos, introduciendo paquetes vulnerables alucinados, omitiendo validaciones de autorización y uniendo entradas HTTP externas directamente a bases de datos.',
      card2Badge: '02 • EL DILEMA DEL ESCÁNER TRADICIONAL',
      card2Title: 'Los Escáneres Viejos Destruyen el Ritmo',
      card2Desc: 'Lanzar 600 alertas estáticas de CVE a un desarrollador causa fatiga instantánea de alertas. El resultado es ignorar los avisos y desplegar código inseguro en producción de todos modos.',
      card3Badge: '03 • EL ARNÉS DETERMINISTA ARMELIS',
      card3Title: 'Alcance Real por Grafos AST',
      card3Desc: 'Armelis analiza el árbol de llamadas AST de extremo a extremo. Si la vulnerabilidad no es alcanzable, guarda silencio. Si lo es, aísla el punto crítico exacto y te entrega un prompt en 1 clic para que tu IA lo corrija en segundos.',
      promptTitle: 'Prompt de Remediación para IA en 1 Clic',
      promptDesc: 'Pega los hallazgos de Armelis directamente en Cursor, Copilot o Claude Code para corregir el punto crítico sin sacrificar tu velocidad de desarrollo.',
      promptSnippet: `Corrige el punto crítico en package.json y controllers/auth.ts:
- Actualiza jsonwebtoken de 8.5.1 a ^9.0.2 (CVE-2025-4128)
- Aplica algorithms: ['RS256'] explícito en jwt.verify()
- Valida que req.user.tenantId coincida con order.tenantId antes de consultar la BD`,
      ctaConsole: 'Auditar Repositorio de IA en la Consola →'
    },
    docs: {
      eyebrow: 'DOCUMENTACIÓN TÉCNICA',
      title: 'Guía para Desarrolladores y SecOps',
      subtitle: 'Todo lo necesario para escanear repositorios, construir grafos de ataque, enviar telemetría a SIEM y proteger pipelines CI/CD.',
      tabCli: 'Inicio Rápido CLI',
      tabGraph: 'Motor de Grafos',
      tabSiem: 'Integración SIEM',
      tabCicd: 'Puerta CI/CD',
      cliTitle: 'Escaneo por Terminal y Línea de Comandos',
      cliDesc: 'Instala el binario ligero o paquete npm para analizar repositorios locales, generar reportes SARIF y calcular puntuaciones de alcance en tu máquina.',
      graphTitle: 'Arquitectura Determinista de Grafos de Ataque',
      graphDesc: 'Cómo Armelis sintetiza archivos lockfile, árboles de llamadas AST y sumideros contaminados en grafos acíclicos dirigidos para aislar el punto crítico.',
      siemTitle: 'Puente de Telemetría Empresarial para SOC y SIEM',
      siemDesc: 'Envía cargas útiles estructuradas en CEF (Common Event Format) y Elastic ECS directamente hacia Splunk, Microsoft Sentinel o Elasticsearch.',
      cicdTitle: 'Puerta de Calidad Automatizada en GitHub Actions',
      cicdDesc: 'Bloquea pull requests de forma determinista únicamente cuando se demuestra matemáticamente que la ruta del exploit es alcanzable.',
      copySnippet: 'Copiar código'
    },
    platforms: {
      eyebrow: 'Ecosistema Multiplataforma',
      title: 'Ejecuta en cualquier lugar. De la terminal al escritorio.',
      tabCli: 'CLI Armelis (Terminal y CI)',
      tabDesktop: 'Armelis Desktop (Windows)',
      cliHeading: 'Seguridad Rápida y sin Interfaz Gráfica para Desarrolladores y CI/CD',
      cliP1: 'Construido en Node y Rust, el CLI de Armelis está optimizado para velocidad. Ejecuta análisis profundo de alcance AST en segundos, transmite resultados directamente a stdout o exporta reportes SARIF compatibles con GitHub Code Scanning.',
      cliP2: 'Sin configuración requerida. Apunta a cualquier directorio que contenga package.json, Cargo.lock o poetry.lock para iniciar la síntesis de grafos.',
      desktopHeading: 'Centro Táctico de Comando de Seguridad para Windows',
      desktopP1: 'Un centro de control visual de alto rendimiento diseñado para arquitectos de seguridad y analistas SOC. Incluye grafos de ataque interactivos DAG, dock de telemetría SIEM en vivo y diffs de código de remediación en 1 clic.',
      desktopP2: 'Incluye un tacómetro HUD de exposición que reacciona en tiempo real cuando cortas puntos críticos, validando la reducción inmediata del riesgo.',
      downloadInstaller: 'Descargar Instalador Windows (EXE)',
      githubReleases: 'Lanzamientos en GitHub',
      buildFromSource: 'Compilar desde el Código Fuente'
    },
    openSource: {
      eyebrow: 'Libertad y Transparencia',
      title: '100% Gratuito y de Código Abierto.',
      desc: 'Armelis es software libre bajo la permisiva Licencia MIT. Inspecciona cada línea de código, ejecútalo completamente offline y construye integraciones de seguridad personalizadas con total confianza.',
      readLicense: 'Leer Licencia MIT',
      viewSource: 'Ver Código Fuente en GitHub'
    },
    install: {
      eyebrow: 'Instalación Inmediata',
      title: 'Comienza en 30 segundos.',
      tabCli: 'CLI Armelis',
      tabDesktop: 'Escritorio Windows',
      tabDocker: 'Contenedor Docker',
      step1Title: 'Instalación Global',
      step1Desc: 'Instala el CLI de Armelis globalmente usando npm o pnpm:',
      step2Title: 'Escanear Cualquier Repositorio Local',
      step2Desc: 'Ejecuta un escaneo determinista de alcance en tu directorio actual:',
      step3Title: 'Exportar a Formatos SARIF o SIEM',
      step3Desc: 'Genera reportes compatibles con GitHub Security o colectores SOC:',
      desktopStep1Title: 'Descargar Instalador Ejecutable para Windows',
      desktopStep1Desc: 'Obtén el instalador NSIS independiente oficial desde GitHub Releases:',
      desktopStep2Title: 'Compilar desde el Código Fuente (Alternativa)',
      desktopStep2Desc: 'Clona el repositorio y compila el paquete de escritorio Electron localmente:',
      dockerStep1Title: 'Descargar Imagen Oficial de Contenedor',
      dockerStep1Desc: 'Descarga la imagen precompilada multiarquitectura:',
      dockerStep2Title: 'Montar Repositorio Local y Escanear',
      dockerStep2Desc: 'Monta cualquier directorio local sin instalar Node ni Rust en el equipo anfitrión:',
      launchConsole: 'Iniciar Consola en Vivo'
    },
    footer: {
      tagline: 'ARMELIS • INTELIGENCIA EN SEGURIDAD DE APLICACIONES',
      privacy: 'Política de Privacidad',
      terms: 'Términos de Uso',
      license: 'Licencia MIT',
      credit: 'DESARROLLADO POR JOHAN VÁSQUEZ'
    },
    lightbox: {
      highlights: 'Aspectos Arquitectónicos Clave',
      close: 'Cerrar'
    }
  }
};
