# ACM@UIUC Resume Book

## Deployment Environments
### Dev/QA
API: https://resumes.aws.qa.acmuiuc.org
Web UI: https://resumes.qa.acmuiuc.org

### Prod
API: https://resumes.aws.acmuiuc.org
Web UI: https://resumes.acm.illinois.edu

## PR Guidelines

### Naming Conventions

kebab case please!

- team: `fe`, `be`
- type: `feature`, `bug`, `hotfix`, `wip`
- id: relevant id on github issues
- description: 2-5 word description (shortened title)

`{team}/{type}-{id}-{description}`

eg: `fe/feature-001-upload-file-endpoint`

### Branch PR Approval Requirements

`dev`

- approval from one CODEOWNERS
- approval from additional team member

`prod`

- approval from two CODEOWNERS

### Merging

squash commits!
