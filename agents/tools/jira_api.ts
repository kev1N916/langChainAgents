import JiraApi from 'jira-client';
import dotenv from 'dotenv';

dotenv.config();

interface Comment {
  author: string;
  created: string;
  body: string;
}

interface IssueSummary {
  summary: string;
  description: string;
  status: string;
  sprint_name: string;
  sprint_goal: string;
  comments: Comment[];
}

export class JiraService {
  private jira: JiraApi;

  constructor() {
    const url = process.env.JIRA_URL;
    const email = process.env.JIRA_EMAIL;
    const token = process.env.JIRA_API_TOKEN;

    if (!url || !email || !token) {
      throw new Error("Missing environment variables for Jira configuration");
    }

    const host = url.replace(/^https?:\/\//, "");

    this.jira = new JiraApi({
      protocol: "https",
      host: host,
      username: email,
      password: token,
      apiVersion: "2",
      strictSSL: true,
    });
  }

  public async getSummary(): Promise<Record<string, IssueSummary>> {
    const result: Record<string, IssueSummary> = {};

    try {
      const boards = await this.jira.getAllBoards();

      for (const board of boards.values || []) {
        const boardId = board.id;

        const sprints = await this.jira.getAllSprints(boardId);

        for (const sprint of sprints.values || []) {
          const sprintId = sprint.id;
          const sprintName = sprint.name || 'N/A';
          const sprintGoal = sprint.goal || 'N/A';

          const sprintIssues = await this.jira.getBoardIssuesForSprint(boardId, sprintId);

          for (const issue of sprintIssues.issues || []) {
            const key = issue.key;
            const fields = issue.fields;
            const summary = fields.summary || 'N/A';
            const description = fields.description || 'N/A';
            const status = fields.status?.name || 'N/A';

            const commentsResponse = await this.jira.getComments(key);
            const commentsList: Comment[] = commentsResponse.comments.map((comment: any) => ({
              author: comment.author?.displayName || 'N/A',
              created: comment.created,
              body: comment.body
            }));

            result[key] = {
              summary,
              description,
              status,
              sprint_name: sprintName,
              sprint_goal: sprintGoal,
              comments: commentsList
            };
          }
        }
      }

      return result;
    } catch (error) {
      console.error("Failed to fetch JIRA data:", error);
      return {};
    }
  }
}

export default JiraService;