import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import {JiraService} from "./jiraService";
import {MailSender} from "./mailSender";

const jiraService=new JiraService()
const mailSender= new MailSender()

const sendEmail = new DynamicStructuredTool({
    name: "send_email",
    description:`
    Sends an email to a specified recipient with the given subject and body.
    This function facilitates the sending of email messages. It's a general-purpose
    email utility and can be used whenever there's a need to dispatch an email
    to an individual or a group of recipients.

    Args:
        recipient (str): The email address of the primary recipient (e.g., "john.doe@example.com").
                         For multiple recipients, this could be a comma-separated string
                         or a list of strings, depending on the underlying email sending library's
                         expected format.
        subject (str): The subject line of the email. This will appear in the recipient's inbox
                       as the title of the email.
        body (str): The main content of the email message.

    Returns:
        dict: A dictionary indicating the status of the email sending operation.
              - If the email is sent successfully, the 'status' key will be "success".
                Example success structure:
                {
                    "status": "success",
                    "message": "Email successfully sent to john.doe@example.com."
                }
              - If an error occurs during the sending process (e.g., invalid recipient address,
                connection issues with the email server, authentication failure), the 'status' key
                will be "error" and the 'error_message' key will provide details about the failure.
                Example error structure:
                {
                    "status": "error",
                    "error_message": "Failed to connect to email server. Please check network settings."
                }`,
    schema: z.object({
        subject: z.string().describe("The subject of the email"),
        recipient: z.string().describe("The email address of the recipient"),
        body: z.string().describe("The body content of the email which is a plain text.")
    }),
    func: async ({ subject, recipient, body }) => {
        try {
            await mailSender.sendMail(subject, recipient, body);
            return { status: "success", message: "Email sent successfully!" };
        } catch (error) {
            return { status: "error", error_message: `Failed to send email` };
        }
    }
})


const getIssuesAndComments = new DynamicStructuredTool({
  name: "get_issues_comments_from_jira",
  description:
  `Retrieves all ISSUES and their associated COMMENTS for SPRINTS of PROJECTS within JIRA.
    These PROJECTS all belong to the user.
    If the user is not using JIRA, this function should not be invoked.
    This function is specifically designed to interact with Jira instances to fetch sprint and project-related data.
    It should ONLY be used when the user needs to find issues and their corresponding comments
    for a sprint of a project that resides within Jira. If the project or its tracking system is not Jira,
    this function will not be applicable and should not be invoked.
  returns a Promise that resolves to a dictionary containing the status of the operation and the retrieved data or an error message.
  - If successful, the 'status' key will be "success" and the 'result' key will contain
  a dictionary where keys are issue keys (e.g., "PROJ-123") and values are dictionaries
  containing issue details, which sprint the issue belongs to, and a list of comments.
  Example success structure:
  {
  "status": "success",
  "result": {
  "PROJ-1": {
  "summary": "Implement user authentication",
  "description": "As a user, I want to log in securely.",
  "status": "Open",
  "sprint_name": "Sprint 1",
  "sprint_goal": "Complete user authentication feature",
  "comments": [
  {"author": "john.doe", "created": "2023-10-26T10:00:00Z", "body": "Initial thoughts on implementation."},
  {"author": "jane.smith", "created": "2023-10-26T14:30:00Z", "body": "Assigned to development team."}
  ]
  },
  "PROJ-2": {
  "summary": "Fix UI bug on login page",
  "description": "Button is misaligned in Chrome.",
  "status": "In Progress",
  "comments": []
  }
  }
  }
  - If an error occurs (e.g., project not found, Jira API issues, or invalid project key),
  the 'status' key will be "error" and the 'error_message' key will provide details
  about the failure.
  Example error structure:
 {
  "status": "error",
  "error_message": "Project with key 'NONEXISTENT' not found in Jira."
  }
  `,
  schema: z.object({
  }),
  func: async () => {

    return jiraService.getSummary()
  },
});



export { sendEmail,getIssuesAndComments };