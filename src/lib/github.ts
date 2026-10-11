
export type ContributionDay = {
  date: string;
  contributionCount: number;
  contributionLevel: string;
  color: string;
  weekday: number;
};

export type ContributionCalendar = {
  totalContributions: number;
  weeks: {
    firstDay: string;
    contributionDays: ContributionDay[];
  }[];
  months: {
    name: string;
    firstDay: string;
    totalWeeks: number;
    year: number;
  }[];
};

type GraphQLResponse = {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: ContributionCalendar;
      };
    } | null;
  };
  errors?: { message: string }[];
};

const query = `
  query (
    $login: String!
    $from: DateTime!
    $to: DateTime!
  ) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          months {
            name
            firstDay
            totalWeeks
            year
          }
          weeks {
            firstDay
            contributionDays {
              date
              contributionCount
              contributionLevel
              color
              weekday
            }
          }
        }
      }
    }
  }
`;

export async function getGithubContributionCalendar():
  Promise<ContributionCalendar> {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME;

  if (!token || !username) {
    throw new Error("Missing GitHub environment variables");
  }

  const to = new Date();
  const from = new Date(to);
  from.setUTCFullYear(from.getUTCFullYear() - 1);

  const response = await fetch(
    "https://api.github.com/graphql",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          login: username,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }),
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) {
    throw new Error(
      `GitHub request failed: ${response.status}`,
    );
  }

  const result =
    (await response.json()) as GraphQLResponse;

  if (result.errors?.length) {
    throw new Error(
      result.errors.map((error) => error.message).join("; "),
    );
  }

  const calendar =
    result.data?.user?.contributionsCollection
      .contributionCalendar;

  if (!calendar) {
    throw new Error("GitHub contribution calendar not found");
  }

  return calendar;
}
