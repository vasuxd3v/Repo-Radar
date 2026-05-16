import { Octokit } from '@octokit/rest';

export interface SearchParams {
  query: string;
  language?: string;
  topics?: string[];
  minStars?: number;
  sort?: 'stars' | 'updated' | 'best-match';
  perPage?: number;
}

export interface RepoResult {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  ownerBio: string | null;
  topics: string[];
  language: string | null;
  lastUpdated: string;
}

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function searchRepos(params: SearchParams): Promise<RepoResult[]> {
  const { query, language, topics, minStars, sort = 'best-match', perPage = 20 } = params;

  const parts: string[] = [query];
  if (language) parts.push(`language:${language}`);
  if (topics) topics.forEach((t) => parts.push(`topic:${t}`));
  if (minStars !== undefined) parts.push(`stars:>=${minStars}`);

  const q = parts.join(' ');

  const searchResponse = await octokit.search.repos({
    q,
    sort: sort === 'best-match' ? undefined : sort,
    per_page: perPage,
  });

  const items = searchResponse.data.items;

  const results = await Promise.all(
    items.map(async (item) => {
      let ownerBio: string | null = null;
      try {
        const userResponse = await octokit.users.getByUsername({
          username: item.owner?.login ?? '',
        });
        ownerBio = userResponse.data.bio ?? null;
      } catch {
        // owner bio is non-critical; silently skip
      }

      return {
        name: item.full_name,
        description: item.description ?? null,
        url: item.html_url,
        stars: item.stargazers_count,
        ownerBio,
        topics: item.topics ?? [],
        language: item.language ?? null,
        lastUpdated: item.updated_at,
      };
    })
  );

  return results;
}

export async function fetchReadme(fullName: string): Promise<string | null> {
  try {
    const [owner, repo] = fullName.split('/');
    const response = await octokit.repos.getReadme({ owner, repo });
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    // Truncate to keep token usage manageable
    return content.slice(0, 3000);
  } catch {
    return null;
  }
}
