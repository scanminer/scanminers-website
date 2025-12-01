"use client";

import { useState } from "react";
import {
  Brain,
  Loader2,
  AlertCircle,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BrainResponse } from "@/lib/scanminers-brain/types";

interface LeadBrainPanelProps {
  leadId: string;
  leadTitle: string;
  leadDescription?: string;
  commodities?: string[];
  region?: string;
  context?: string;
}

export function LeadBrainPanel({
  leadId,
  leadTitle,
  leadDescription,
  commodities,
  region,
  context,
}: LeadBrainPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<BrainResponse | null>(null);

  const queryBrain = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/scanminers-brain/related", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          title: leadTitle,
          description: leadDescription || "",
          commodities: commodities || [],
          region: region || "",
          context: context || "",
          limit: 5,
        }),
      });

      if (!res.ok) {
        const errData = await res
          .json()
          .catch(() => ({} as { error?: string }));
        throw new Error(
          (errData as { error?: string }).error ||
            `Request failed: ${res.status}`
        );
      }

      const data = (await res.json()) as BrainResponse;
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to query Brain");
    } finally {
      setLoading(false);
    }
  };

  const fitColorClass = {
    strong: "bg-green-500/20 text-green-400 border-green-500/30",
    moderate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    weak: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Scanminers Brain</h3>
        </div>
        <Badge className="text-xs">v0.1</Badge>
      </div>

      {!response && !loading && !error && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Query the knowledge base for insights related to this lead.
          </p>
          <Button
            onClick={queryBrain}
            disabled={loading}
            size="sm"
            className="w-full"
          >
            <Brain className="h-4 w-4 mr-2" />
            Find Related Knowledge
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">
            Querying knowledge base...
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Error</span>
          </div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={queryBrain} size="sm" variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {response && (
        <div className="space-y-4">
          {/* Assessment Summary */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Fit</span>
              <Badge className={fitColorClass[response.assessment.overallFit]}>
                {response.assessment.overallFit.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-foreground">
              {response.assessment.summary}
            </p>
          </div>

          {/* Related Knowledge Items */}
          {response.results.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Related Knowledge ({response.results.length})
              </h4>
              <div className="space-y-2">
                {response.results.map((result) => (
                  <div
                    key={result.item.id}
                    className="rounded-lg border bg-card p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={result.item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        {result.item.title}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <Badge className="text-xs shrink-0 bg-muted/50">
                        {(result.score * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {result.relevanceReason}
                    </p>
                    {result.item.commodities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {result.item.commodities.slice(0, 4).map((c) => (
                          <Badge key={c} variant="mineral" className="text-xs">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Needs */}
          {response.assessment.suggestedDataNeeds.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Suggested Data Needs</h4>
              <ul className="space-y-1">
                {response.assessment.suggestedDataNeeds.map((need, i) => (
                  <li
                    key={i}
                    className="text-xs text-muted-foreground flex items-start gap-2"
                  >
                    <ArrowRight className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                    {need}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {response.assessment.potentialRisks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Potential Risks
              </h4>
              <ul className="space-y-1">
                {response.assessment.potentialRisks.map((risk, i) => (
                  <li
                    key={i}
                    className="text-xs text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-yellow-500">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {response.assessment.recommendedNextSteps.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recommended Next Steps</h4>
              <ol className="space-y-1 list-decimal list-inside">
                {response.assessment.recommendedNextSteps.map((step, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-2 border-t text-xs text-muted-foreground flex justify-between">
            <span>
              {response.metadata.totalKnowledgeItems} items in knowledge base
            </span>
            <span>{response.metadata.processingTimeMs}ms</span>
          </div>

          {/* Re-query button */}
          <Button
            onClick={queryBrain}
            size="sm"
            variant="outline"
            className="w-full"
          >
            <Brain className="h-4 w-4 mr-2" />
            Re-query
          </Button>
        </div>
      )}
    </Card>
  );
}
