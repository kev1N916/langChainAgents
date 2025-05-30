import JiraApi from 'jira-client';
import dotenv from 'dotenv';

dotenv.config();

interface Comment {
  author: string;
  created: string;
  body: string;
}

interface Sprint {
  id: string;
  name: string;
  goal: string;

}

interface Issue {
  summary: string;
  description: string;
  status: string;
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
  try {
    const boards = await this.jira.getAllBoards();
    
    const result = await boards.values?.reduce(async (accPromise, board) => {
      const acc = await accPromise;
      const boardId = board.id;
      
      const sprints = await this.jira.getAllSprints(boardId);
      
      const sprintResult = await sprints.values?.reduce(async (sprintAccPromise, sprint) => {
        const sprintAcc = await sprintAccPromise;
        const sprintId = sprint.id;
        const sprintName = sprint.name || "N/A";
        const sprintGoal = sprint.goal || "N/A";
        
        const sprintIssues = await this.jira.getBoardIssuesForSprint(boardId, sprintId);
        
        const issuesResult = await sprintIssues.issues?.reduce(async (issuesAccPromise, issue) => {
          const issuesAcc = await issuesAccPromise;
          const key = issue.key;
          const fields = issue.fields;
          const summary = fields.summary || "N/A";
          const description = fields.description || "N/A";
          const status = fields.status?.name || "N/A";
          
          const commentsResponse = await this.jira.getComments(key);
          const commentsList: Comment[] = commentsResponse.comments.map(
            (comment: any) => ({
              author: comment.author?.displayName || "N/A",
              created: comment.created,
              body: comment.body,
            })
          );
          
          return {
            ...issuesAcc,
            [key]: {
              summary,
              description,
              status,
              sprint_name: sprintName,
              sprint_goal: sprintGoal,
              comments: commentsList,
            },
          };
        }, Promise.resolve({}));
        
        return { ...sprintAcc, ...issuesResult };
      }, Promise.resolve({}));
      
      return { ...acc, ...sprintResult };
    }, Promise.resolve({}));
    
    return result || {};
  } catch (error) {
    console.error("Failed to fetch JIRA data:", error);
    return {};
  }
}

  public async getIssuesForSpecficSprint(sprint_Name: string) {
    const result: Record<string, Issue> = {};

    try {
      const boards = await this.jira.getAllBoards();

      for (const board of boards.values || []) {
        const boardId = board.id;

        const sprints = await this.jira.getAllSprints(boardId);

        for (const sprint of sprints.values || []) {
          console.log(sprint)
          const sprintId = sprint.id;
          const sprintName = sprint.name || 'N/A';
          const sprintGoal = sprint.goal || 'N/A';

          if (sprintName === sprint_Name) {
            const sprintIssues = await this.jira.getBoardIssuesForSprint(boardId, sprintId);
            for (const issue of sprintIssues.issues || []) {
              const key = issue.key;
              const fields = issue.fields;
              const summary = fields.summary || 'N/A';
              const description = fields.description || 'N/A';
              const status = fields.status?.name || 'N/A';


              result[key] = {
                summary,
                description,
                status,

              };
            }
            return {
              "success": true,
              "issues": result,
            };
          }
        }
      }

      return {
        "success": false,
      };
    } catch (error) {
      console.error("Failed to fetch JIRA data:", error);
      return {
        "success": false,

      };
    }

  }
  public async getAllSprints() {
    const result: Record<string, Sprint> = {};


    try {
      const boards = await this.jira.getAllBoards();

      for (const board of boards.values || []) {
        const boardId = board.id;

        const sprints = await this.jira.getAllSprints(boardId);

        for (const sprint of sprints.values || []) {
          console.log(sprint)
          const sprintId = sprint.id;
          const sprintName = sprint.name || 'N/A';
          const sprintGoal = sprint.goal || 'N/A';
          result[sprintName] = {
            id: sprintId,
            name: sprintName,
            goal: sprintGoal
          }
        }
      }

      return {
        "success": true,
        "sprints": result
      };
    } catch (error) {
      console.error("Failed to fetch JIRA data:", error);
      return {
        "success": false
      };
    }
  }


  public async getSpecificSprint(sprint_Name: string) {

    try {
      const boards = await this.jira.getAllBoards();

      for (const board of boards.values || []) {
        const boardId = board.id;

        const sprints = await this.jira.getAllSprints(boardId);

        for (const sprint of sprints.values || []) {
          console.log(sprint)
          const sprintId = sprint.id;
          const sprintName = sprint.name || 'N/A';
          const sprintGoal = sprint.goal || 'N/A';

          if (sprintName === sprint_Name)
            return {
              "success": true,
              "sprint": {
                id: sprintId,
                goal: sprintGoal
              }
            }
        }
      }

      return {
        "success": false,
      };
    } catch (error) {
      console.error("Failed to fetch JIRA data:", error);
      return {
        "success": false,
      }
    }
  }
  // public async 
}

export default JiraService;