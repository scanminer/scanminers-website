export type CommodityDocMeta = {
  type: "Insight" | "Case Study";
  title: string;
  url: string;
  summary?: string;
  region?: string;
  publishedAt: string;
};

export type CommodityStatus = "mature" | "emerging" | "scouting";

export type CriticalMineralBlueprint = {
  key: string;
  label: string;
  summary: string;
  sensors: string;
  defaultRegion?: string;
  pipelineStatus?: string;
  aliases?: string[];
};

export type CommodityContent = {
  title: string;
  url: string;
  summary?: string;
  region?: string;
  publishedAt: string;
  commodities?: string[];
  commodity?: string | string[];
};

export type CommoditySummary = { label: string; docs: CommodityDocMeta[] };

export type CriticalCoverageRow = {
  key: string;
  label: string;
  summary: string;
  sensors: string;
  defaultRegion?: string;
  docsCount: number;
  coverage: string[];
  docTypes: string[];
  latestDoc?: CommodityDocMeta;
  status: string;
  maturity: CommodityStatus;
};

const CLEAN_KEY_REGEX = /[^a-z0-9]+/g;

export const extractCommodityList = (doc: CommodityContent): string[] => {
  if (Array.isArray(doc.commodities) && doc.commodities.length > 0) return doc.commodities;
  if (Array.isArray(doc.commodity) && doc.commodity.length > 0) return doc.commodity;
  if (typeof doc.commodity === "string" && doc.commodity.trim().length > 0) return [doc.commodity];
  return [];
};

export const canonicalizeCommodity = (value: string): { key: string; label: string } | null => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  if (["bauxite", "aluminum", "aluminium"].includes(normalized)) {
    return { key: "bauxite", label: "Bauxite & Aluminum" };
  }
  if (["co", "cobalt"].includes(normalized)) {
    return { key: "cobalt", label: "Cobalt" };
  }
  if (["ree", "rare earth", "rare earths", "rare earth elements", "rare-earth-elements"].includes(normalized)) {
    return { key: "rare-earths", label: "Rare Earth Elements" };
  }
  if (["multi-commodity", "multi commodity", "multicommodity"].includes(normalized)) {
    return { key: "multi-commodity", label: "Multi-Commodity Programs" };
  }
  return {
    key: normalized.replace(CLEAN_KEY_REGEX, "-"),
    label: value.replace(/\b\w/g, (char) => char.toUpperCase()),
  };
};

const registerDocs = (
  summaries: Map<string, CommoditySummary>,
  docs: CommodityContent[],
  docType: CommodityDocMeta["type"],
) => {
  docs.forEach((doc) => {
    const commodities = extractCommodityList(doc);
    commodities.forEach((value) => {
      const canonical = canonicalizeCommodity(value);
      if (!canonical) return;
      const entry = summaries.get(canonical.key) ?? { label: canonical.label, docs: [] };
      entry.docs.push({
        type: docType,
        title: doc.title,
        url: doc.url,
        summary: doc.summary,
        region: doc.region,
        publishedAt: doc.publishedAt,
      });
      summaries.set(canonical.key, entry);
    });
  });
};

export const aggregateCommoditySummaries = (
  sources: Array<{ docs: CommodityContent[]; type: CommodityDocMeta["type"] }>,
): Map<string, CommoditySummary> => {
  const summaries = new Map<string, CommoditySummary>();
  sources.forEach((source) => registerDocs(summaries, source.docs, source.type));
  return summaries;
};

const deriveMaturity = (docs: CommodityDocMeta[]): CommodityStatus => {
  const hasCaseStudy = docs.some((doc) => doc.type === "Case Study");
  if (hasCaseStudy && docs.length >= 2) return "mature";
  if (docs.length >= 1) return "emerging";
  return "scouting";
};

export const buildCriticalCoverageRows = (
  blueprint: CriticalMineralBlueprint[],
  summaries: Map<string, CommoditySummary>,
): CriticalCoverageRow[] =>
  blueprint.map((row) => {
    const aliases = Array.isArray(row.aliases) ? row.aliases : [];
    const stat =
      summaries.get(row.key) ||
      aliases.map((alias) => summaries.get(alias)).find((entry): entry is CommoditySummary => Boolean(entry));
    const docs = stat?.docs ?? [];
    const coverage = Array.from(new Set(docs.map((doc) => doc.region).filter((value): value is string => Boolean(value))));
    const docTypes = Array.from(new Set(docs.map((doc) => doc.type)));
    const latestDoc =
      docs.length > 0
        ? [...docs].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())[0]
        : undefined;

    return {
      key: row.key,
      label: row.label,
      summary: row.summary,
      sensors: row.sensors,
      defaultRegion: row.defaultRegion,
      docsCount: docs.length,
      coverage,
      docTypes,
      latestDoc,
      status: docs.length > 0 ? "Active" : row.pipelineStatus ?? "In pipeline",
      maturity: deriveMaturity(docs),
    };
  });

export const CRITICAL_MINERAL_BLUEPRINT: CriticalMineralBlueprint[] = [
  {
    key: "bauxite",
    label: "Bauxite & Aluminum",
    summary:
      "Laterite prospectivity decks across the Taurus belt with MTMF, DPCA, and AI-MPM ranking for 7 target zones.",
    sensors: "ASTER • Landsat 8/9 • PALSAR-2 • DEM-derived structure",
    defaultRegion: "Payas–İslahiye, Turkey",
    pipelineStatus: "Active",
  },
  {
    key: "cobalt",
    label: "Cobalt (battery supply)",
    summary:
      "Supply-chain telemetry, artisanal mining detection, and ESG monitoring for DRC + Indonesian feedstocks.",
    sensors: "PRISMA • Sentinel-1 SAR • Multispectral + supply-chain data",
    defaultRegion: "DRC · Indonesia · Global EV corridors",
    pipelineStatus: "Active",
  },
  {
    key: "rare-earths",
    label: "Rare Earth Elements",
    summary:
      "Carbonatite + alkaline complex prospectivity with Random Forest / XGBoost ensembles, SHAP explainability, and uncertainty tiles.",
    sensors: "ASTER • Sentinel-2 • PRISMA • DEM lineaments",
    defaultRegion: "Global carbonatite-alkaline complexes",
    pipelineStatus: "Active",
    aliases: ["ree", "rare earth elements", "rare-earth-elements"],
  },
  {
    key: "multi-commodity",
    label: "SAR + Tailings Monitoring",
    summary:
      "All-weather SAR structural intelligence paired with LiDAR change detection for tailings governance and multi-commodity programs.",
    sensors: "Sentinel-1 SAR • UAV LiDAR • Thermal + multispectral overlays",
    defaultRegion: "Cloud-prone belts · Tailings facilities worldwide",
    pipelineStatus: "Active",
    aliases: ["multi commodity", "multicommodity"],
  },
  {
    key: "lithium",
    label: "Lithium (brines + pegmatites)",
    summary:
      "EMIT / PRISMA hyperspectral fusion with brine chemistry dashboards—slots open for Lithium Triangle + James Bay AOIs.",
    sensors: "EMIT • PRISMA • ASTER • Gravity + TEM",
    defaultRegion: "Lithium Triangle · James Bay, QC",
    pipelineStatus: "Scoping",
  },
  {
    key: "nickel",
    label: "Nickel & PGMs",
    summary:
      "Laterite + sulfide programs combining Falcon magnetics, SAR texture metrics, and explainable boosters.",
    sensors: "Falcon EM • Sentinel-1/2 • ASTER • DEM derivatives",
    defaultRegion: "Sulawesi · West Africa · Labrador Trough",
    pipelineStatus: "Scoping",
  },
];
