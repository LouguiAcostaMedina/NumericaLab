'use client';

import React from 'react';

interface SkeletonLoaderProps {
  type?: 'table' | 'chart' | 'both';
}

export function SkeletonLoader({ type = 'both' }: SkeletonLoaderProps) {
  const isTable = type === 'table' || type === 'both';
  const isChart = type === 'chart' || type === 'both';

  return (
    <div className="space-y-8 animate-pulse w-full">
      {/* Skeleton summary card */}
      {isTable && (
        <div className="bg-zinc-200/50 dark:bg-zinc-800/40 border border-zinc-200/40 dark:border-zinc-800/40 p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="h-3 w-32 bg-zinc-350 dark:bg-zinc-700 rounded" />
            <div className="h-8 w-48 bg-zinc-300 dark:bg-zinc-650 rounded" />
          </div>
          <div className="h-16 w-36 bg-zinc-300 dark:bg-zinc-650 rounded-lg sm:self-center" />
        </div>
      )}

      {/* Grid containing table and/or chart skeletons */}
      <div className="space-y-6">
        {/* Table Skeleton */}
        {isTable && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-36 bg-zinc-350 dark:bg-zinc-700 rounded" />
              <div className="h-4 w-24 bg-zinc-300 dark:bg-zinc-650 rounded" />
            </div>
            <div className="border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
              {/* Fake Table Header */}
              <div className="bg-zinc-100 dark:bg-zinc-850/50 px-4 py-3.5 border-b border-zinc-250 dark:border-zinc-800 flex justify-between">
                <div className="h-3 w-8 bg-zinc-350 dark:bg-zinc-700 rounded" />
                <div className="h-3 w-20 bg-zinc-350 dark:bg-zinc-700 rounded" />
                <div className="h-3 w-20 bg-zinc-350 dark:bg-zinc-700 rounded" />
                <div className="h-3 w-24 bg-zinc-350 dark:bg-zinc-700 rounded" />
                <div className="h-3 w-16 bg-zinc-350 dark:bg-zinc-700 rounded" />
              </div>
              {/* Fake Table Rows */}
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 px-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="py-3 flex justify-between items-center">
                    <div className="h-3 w-4 bg-zinc-300 dark:bg-zinc-650 rounded" />
                    <div className="h-3 w-16 bg-zinc-250 dark:bg-zinc-700 rounded" />
                    <div className="h-3 w-16 bg-zinc-250 dark:bg-zinc-700 rounded" />
                    <div className="h-3 w-20 bg-zinc-300 dark:bg-zinc-650 rounded" />
                    <div className="h-3 w-12 bg-zinc-250 dark:bg-zinc-700 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chart Skeleton */}
        {isChart && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-48 bg-zinc-350 dark:bg-zinc-700 rounded" />
              <div className="h-4 w-32 bg-zinc-300 dark:bg-zinc-650 rounded" />
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 h-80 flex flex-col justify-between">
              {/* Fake Chart Grid lines */}
              <div className="flex-1 flex flex-col justify-between py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full border-b border-dashed border-zinc-200 dark:border-zinc-850 h-0.5" />
                ))}
              </div>
              <div className="flex justify-between pt-2">
                <div className="h-3 w-8 bg-zinc-300 dark:bg-zinc-650 rounded" />
                <div className="h-3 w-8 bg-zinc-300 dark:bg-zinc-650 rounded" />
                <div className="h-3 w-8 bg-zinc-300 dark:bg-zinc-650 rounded" />
                <div className="h-3 w-8 bg-zinc-300 dark:bg-zinc-650 rounded" />
                <div className="h-3 w-8 bg-zinc-300 dark:bg-zinc-650 rounded" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
