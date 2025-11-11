import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { type, description } = await request.json();

    if (!type || !description) {
      return NextResponse.json({ error: 'Missing type or description' }, { status: 400 });
    }

    if (!['issue', 'feature'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be "issue" or "feature"' }, { status: 400 });
    }

    const token = process.env.GITHUB_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    const title = type === 'issue' ? `🐛 Bug Report` : `✨ Feature Request`;
    const body = `**Type:** ${type === 'issue' ? 'Bug Report' : 'Feature Request'}

**Description:**
${description}

---
*Reported via risshella-website*`;

    const response = await fetch('https://api.github.com/repos/nguyen-anthony/risshella-website/issues', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'risshella-website/1.0',
      },
      body: JSON.stringify({
        title,
        body,
        labels: [type === 'issue' ? 'bug' : 'enhancement'],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('GitHub API error:', error);
      return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
    }

    const issue = await response.json();
    return NextResponse.json({ success: true, issueNumber: issue.number });
  } catch (error) {
    console.error('Error creating issue:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}