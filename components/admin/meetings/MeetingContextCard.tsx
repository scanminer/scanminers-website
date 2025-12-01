"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Link2, X, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  linkToLeadAction,
  linkToProjectAction,
  unlinkLeadAction,
  unlinkProjectAction,
} from "@/app/admin/meetings/[id]/actions";

type MeetingContextCardProps = {
  meetingId: string;
  relatedLeadId: string | null;
  relatedProjectId: string | null;
  leadName: string | null | undefined;
  projectName: string | null | undefined;
};

type LeadOption = { id: string; name: string; company?: string | null };
type ProjectOption = { id: string; projectName: string; clientName: string };

export function MeetingContextCard({
  meetingId,
  relatedLeadId,
  relatedProjectId,
  leadName,
  projectName,
}: MeetingContextCardProps) {
  const [showLeadSearch, setShowLeadSearch] = useState(false);
  const [showProjectSearch, setShowProjectSearch] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [linking, setLinking] = useState(false);

  // Fetch leads for linking
  useEffect(() => {
    if (!showLeadSearch) return;
    setLoadingLeads(true);
    fetch("/api/admin/leads/search?limit=50")
      .then((res) => res.json() as Promise<{ leads?: LeadOption[] }>)
      .then((data) => {
        setLeads(data.leads || []);
      })
      .catch(() => setLeads([]))
      .finally(() => setLoadingLeads(false));
  }, [showLeadSearch]);

  // Fetch projects for linking
  useEffect(() => {
    if (!showProjectSearch) return;
    setLoadingProjects(true);
    fetch("/api/admin/projects/search?limit=50")
      .then((res) => res.json() as Promise<{ projects?: ProjectOption[] }>)
      .then((data) => {
        setProjects(data.projects || []);
      })
      .catch(() => setProjects([]))
      .finally(() => setLoadingProjects(false));
  }, [showProjectSearch]);

  const handleLinkLead = async (leadId: string) => {
    setLinking(true);
    try {
      await linkToLeadAction(meetingId, leadId);
      setShowLeadSearch(false);
      setLeadSearch("");
    } finally {
      setLinking(false);
    }
  };

  const handleLinkProject = async (projectId: string) => {
    setLinking(true);
    try {
      await linkToProjectAction(meetingId, projectId);
      setShowProjectSearch(false);
      setProjectSearch("");
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkLead = async () => {
    if (!confirm("Unlink this lead from the meeting?")) return;
    await unlinkLeadAction(meetingId);
  };

  const handleUnlinkProject = async () => {
    if (!confirm("Unlink this project from the meeting?")) return;
    await unlinkProjectAction(meetingId);
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.company?.toLowerCase().includes(leadSearch.toLowerCase())
  );

  const filteredProjects = projects.filter(
    (p) =>
      p.projectName.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
  );

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
        <Link2 className="h-4 w-4 text-muted-foreground" />
        Context
      </h2>

      <div className="space-y-4">
        {/* Lead section */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Lead
          </p>
          {relatedLeadId && leadName ? (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-cyan-950/30 border border-cyan-900/40 p-3">
              <Link
                href={`/admin/leads/${relatedLeadId}`}
                className="text-sm font-medium text-cyan-300 hover:underline"
              >
                {leadName}
              </Link>
              <button
                onClick={handleUnlinkLead}
                className="text-muted-foreground hover:text-red-400 transition"
                title="Unlink lead"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : showLeadSearch ? (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  placeholder="Search leads..."
                  className="pl-9"
                  autoFocus
                />
              </div>
              <div className="max-h-40 overflow-y-auto rounded-lg border bg-background">
                {loadingLeads ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">
                    No leads found
                  </p>
                ) : (
                  filteredLeads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => handleLinkLead(lead.id)}
                      disabled={linking}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted/60 transition"
                    >
                      <span className="font-medium">{lead.name}</span>
                      {lead.company && (
                        <span className="text-muted-foreground">
                          {" "}
                          · {lead.company}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowLeadSearch(false);
                  setLeadSearch("");
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLeadSearch(true)}
                className="w-full justify-start"
              >
                <Link2 className="h-3.5 w-3.5 mr-2" />
                Link to lead
              </Button>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Attach this meeting to a lead for better history.
              </p>
            </div>
          )}
        </div>

        {/* Project section */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Project
          </p>
          {relatedProjectId && projectName ? (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-emerald-950/30 border border-emerald-900/40 p-3">
              <Link
                href={`/admin/projects/${relatedProjectId}`}
                className="text-sm font-medium text-emerald-300 hover:underline"
              >
                {projectName}
              </Link>
              <button
                onClick={handleUnlinkProject}
                className="text-muted-foreground hover:text-red-400 transition"
                title="Unlink project"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : showProjectSearch ? (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Search projects..."
                  className="pl-9"
                  autoFocus
                />
              </div>
              <div className="max-h-40 overflow-y-auto rounded-lg border bg-background">
                {loadingProjects ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">
                    No projects found
                  </p>
                ) : (
                  filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleLinkProject(project.id)}
                      disabled={linking}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted/60 transition"
                    >
                      <span className="font-medium">{project.projectName}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {project.clientName}
                      </span>
                    </button>
                  ))
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowProjectSearch(false);
                  setProjectSearch("");
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProjectSearch(true)}
                className="w-full justify-start"
              >
                <Link2 className="h-3.5 w-3.5 mr-2" />
                Link to project
              </Button>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Attach this meeting to an active project, if applicable.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
