import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Bug, 
  Clock, 
  Layers
} from "lucide-react";
import { ChangelogItem } from "@/types";
import { api } from "@/services/api";
import { FormattedMarkdown } from "./FormattedMarkdown";

export type ChangelogUpdateItem = ChangelogItem;

export interface VersionChangelog {
  version: string;
  date: string;
  isLatest?: boolean;
  features: ChangelogItem[];
  improvements: ChangelogItem[];
  fixes: ChangelogItem[];
}

/**
 * Builds version cards dynamically:
 * Starts at Version 1.0.0.
 * After 3 new features OR 2 bug fixes OR 2 improvements, cuts a new version (1.2.0, 2.0.0, etc.) and repeats.
 */
export function buildChangelogFromUpdates(updatesList: ChangelogItem[]): VersionChangelog[] {
  const versionNames = [
    "Version 1.0.0",
    "Version 1.2.0",
    "Version 2.0.0",
    "Version 2.2.0",
    "Version 3.0.0",
    "Version 3.2.0",
    "Version 4.0.0",
  ];

  const versions: VersionChangelog[] = [];
  let currentFeatures: ChangelogItem[] = [];
  let currentImprovements: ChangelogItem[] = [];
  let currentFixes: ChangelogItem[] = [];
  let versionIndex = 0;
  let currentDate = updatesList[0]?.date || "Recent";

  for (const item of updatesList) {
    if (item.type === "feature") currentFeatures.push(item);
    else if (item.type === "improvement") currentImprovements.push(item);
    else if (item.type === "fix") currentFixes.push(item);
    currentDate = item.date;

    // Threshold check: 3 new features OR 2 bug fixes OR 2 improvements
    if (
      currentFeatures.length >= 3 ||
      currentFixes.length >= 2 ||
      currentImprovements.length >= 2
    ) {
      const vName =
        versionNames[versionIndex] ||
        `Version ${1 + Math.floor(versionIndex / 2)}.${(versionIndex % 2) * 2}.0`;

      versions.push({
        version: vName,
        date: currentDate,
        features: [...currentFeatures],
        improvements: [...currentImprovements],
        fixes: [...currentFixes],
        isLatest: false,
      });

      // Reset bucket for next release cycle
      currentFeatures = [];
      currentImprovements = [];
      currentFixes = [];
      versionIndex++;
    }
  }

  // Any ongoing updates not yet hitting the threshold roll into the active build
  if (
    currentFeatures.length > 0 ||
    currentImprovements.length > 0 ||
    currentFixes.length > 0
  ) {
    const vName =
      versionNames[versionIndex] ||
      `Version ${1 + Math.floor(versionIndex / 2)}.${(versionIndex % 2) * 2}.0 (In Progress)`;

    versions.push({
      version: vName,
      date: currentDate,
      features: [...currentFeatures],
      improvements: [...currentImprovements],
      fixes: [...currentFixes],
      isLatest: false,
    });
  }

  // Mark latest and return descending order (newest first)
  if (versions.length > 0) {
    versions[versions.length - 1].isLatest = true;
  }

  return [...versions].reverse();
}

function ChangelogGroupSection({
  items,
  type,
  title,
  icon,
  headingColor,
  bulletColor,
}: {
  items: ChangelogItem[];
  type: "feature" | "improvement" | "fix";
  title: string;
  icon: React.ReactNode;
  headingColor: string;
  bulletColor: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className={`mb-2 flex items-center text-sm font-semibold ${headingColor}`}>
        {icon}
        <span>{title} ({items.length})</span>
      </h4>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="text-sm">
            <div className="flex items-start gap-2">
              <span className={`size-1.5 rounded-full mt-1.5 shrink-0 ${bulletColor}`} />
              <span className="font-medium text-slate-900 dark:text-slate-100 leading-snug">
                {item.title}
              </span>
            </div>
            {item.description && (
              <div className="pl-3.5 mt-1 text-xs text-slate-600 dark:text-slate-400">
                <FormattedMarkdown content={item.description} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GridChangelog() {
  const [updates, setUpdates] = useState<ChangelogItem[]>(() => api.getLocalChangelogs());

  useEffect(() => {
    let isMounted = true;
    api.getChangelogs()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setUpdates(data);
        }
      })
      .catch(() => {
        // Fallback to local changelogs already loaded
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamically calculate changelog version buckets based on the rule
  const versionChangelog = useMemo(() => {
    return buildChangelogFromUpdates(updates);
  }, [updates]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold">
          <Sparkles className="size-3.5" />
          <span>Platform Release History & Roadmap</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Changelog
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          All notable changes, automated failovers, and security updates deployed to the NexVps Cloud Platform.
        </p>
      </div>

      {/* Tabs matching the GridChangelog component */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8 flex h-fit flex-wrap justify-center gap-2">
          <TabsTrigger value="all">All Updates</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
          <TabsTrigger value="fixes">Bug Fixes</TabsTrigger>
        </TabsList>

        {/* Tab 1: All Updates */}
        <TabsContent value="all" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {versionChangelog.map((ver) => (
              <Card key={ver.version} className="overflow-hidden pt-0 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-md bg-white dark:bg-slate-900/60 backdrop-blur-sm">
                <CardHeader className="bg-slate-100/70 dark:bg-slate-900/90 py-3.5 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                      {ver.version}
                    </CardTitle>
                    {ver.isLatest ? (
                      <Badge variant="cyan" className="font-mono">Latest</Badge>
                    ) : (
                      <Badge variant="secondary" className="font-mono text-slate-500 text-[10px]">Archived</Badge>
                    )}
                  </div>
                  <time className="text-slate-500 dark:text-slate-400 text-xs font-mono mt-0.5 block">
                    {ver.date}
                  </time>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <ChangelogGroupSection
                    items={ver.features}
                    type="feature"
                    title="New Features"
                    icon={<CheckCircle2 className="mr-2 size-4 shrink-0" />}
                    headingColor="text-cyan-600 dark:text-cyan-400"
                    bulletColor="bg-cyan-500"
                  />
                  <ChangelogGroupSection
                    items={ver.improvements}
                    type="improvement"
                    title="Improvements"
                    icon={<Zap className="mr-2 size-4 shrink-0" />}
                    headingColor="text-blue-600 dark:text-blue-400"
                    bulletColor="bg-blue-500"
                  />
                  <ChangelogGroupSection
                    items={ver.fixes}
                    type="fix"
                    title="Bug Fixes"
                    icon={<Bug className="mr-2 size-4 shrink-0" />}
                    headingColor="text-rose-600 dark:text-rose-400"
                    bulletColor="bg-rose-500"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Features Only */}
        <TabsContent value="features" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {versionChangelog
              .filter((ver) => ver.features.length > 0)
              .map((ver) => (
                <Card key={ver.version} className="overflow-hidden pt-0 border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900/60 backdrop-blur-sm">
                  <CardHeader className="bg-slate-100/70 dark:bg-slate-900/90 py-3.5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">{ver.version}</CardTitle>
                      {ver.isLatest ? <Badge variant="cyan">Latest</Badge> : null}
                    </div>
                    <time className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                      {ver.date}
                    </time>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ChangelogGroupSection
                      items={ver.features}
                      type="feature"
                      title="New Features"
                      icon={<CheckCircle2 className="mr-2 size-4 shrink-0" />}
                      headingColor="text-cyan-600 dark:text-cyan-400"
                      bulletColor="bg-cyan-500"
                    />
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Tab 3: Improvements Only */}
        <TabsContent value="improvements" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {versionChangelog
              .filter((ver) => ver.improvements.length > 0)
              .map((ver) => (
                <Card key={ver.version} className="overflow-hidden pt-0 border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900/60 backdrop-blur-sm">
                  <CardHeader className="bg-slate-100/70 dark:bg-slate-900/90 py-3.5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">{ver.version}</CardTitle>
                      {ver.isLatest ? <Badge variant="cyan">Latest</Badge> : null}
                    </div>
                    <time className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                      {ver.date}
                    </time>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ChangelogGroupSection
                      items={ver.improvements}
                      type="improvement"
                      title="Improvements"
                      icon={<Zap className="mr-2 size-4 shrink-0" />}
                      headingColor="text-blue-600 dark:text-blue-400"
                      bulletColor="bg-blue-500"
                    />
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Tab 4: Bug Fixes Only */}
        <TabsContent value="fixes" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {versionChangelog
              .filter((ver) => ver.fixes.length > 0)
              .map((ver) => (
                <Card key={ver.version} className="overflow-hidden pt-0 border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900/60 backdrop-blur-sm">
                  <CardHeader className="bg-slate-100/70 dark:bg-slate-900/90 py-3.5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">{ver.version}</CardTitle>
                      {ver.isLatest ? <Badge variant="cyan">Latest</Badge> : null}
                    </div>
                    <time className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                      {ver.date}
                    </time>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ChangelogGroupSection
                      items={ver.fixes}
                      type="fix"
                      title="Bug Fixes"
                      icon={<Bug className="mr-2 size-4 shrink-0" />}
                      headingColor="text-rose-600 dark:text-rose-400"
                      bulletColor="bg-rose-500"
                    />
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
