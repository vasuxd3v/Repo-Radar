import { NextRequest, NextResponse } from 'next/server';
import { explainRepository } from '@/lib/bob-explainer';

export async function POST(req: NextRequest) {
  try {
    const { repoOwner, repoName, userQuery, experienceLevel } = await req.json();

    if (!repoOwner || !repoName) {
      return NextResponse.json({ error: 'repoOwner and repoName are required' }, { status: 400 });
    }

    const explanation = await explainRepository(
      repoOwner,
      repoName,
      userQuery ?? '',
      experienceLevel ?? 'intermediate'
    );

    return NextResponse.json(explanation);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[RepoRadar] explain error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
